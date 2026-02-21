## GitHub Actions CI/CD for S3 + CloudFront

This guide sets up a secure, keyless pipeline that builds the site and deploys to S3 with CloudFront invalidation using GitHub OIDC (no long‑lived AWS keys). Site in `us-east-1`; assets optional job in `us-west-2`.

### Overview
- Trigger: push to `main` (prod) and PRs (preview)
- Actions:
  - build with Node 20
  - upload build to S3 (prod bucket)
  - create CloudFront invalidation
- Security: GitHub OIDC → AWS IAM Role with least privilege

---

## 1) Configure AWS for OIDC (one time)

1. Create the GitHub OIDC identity provider in IAM (if not already present):
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. Create an IAM role `github-deploy-danpa-resume` with this trust policy (replace `<OWNER>`, `<REPO>`, and optional branch):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:<OWNER>/<REPO>:ref:refs/heads/main",
            "repo:<OWNER>/<REPO>:pull_request"
          ]
        },
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

3. Attach a policy with least privilege for S3 + CloudFront (replace bucket names and distribution IDs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3SiteDeploy",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::danpa-resume-site-prod",
        "arn:aws:s3:::danpa-resume-site-prod/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListDistributions"
      ],
      "Resource": "*"
    }
  ]
}
```

(If you also want the workflow to push images/videos, add the assets bucket ARN resources similarly.)

---

## 2) Repo variables and secrets

Use repo “Actions → Variables”:
- `AWS_REGION` = `us-east-1` (site)
- `ASSETS_REGION` = `us-west-2` (assets)
- `SITE_BUCKET` = `danpa-resume-site-prod`
- `ASSETS_BUCKET` = `danpa-resume-assets-prod` (if using the optional assets job)
- `CF_DISTRIBUTION_ID` = your site CloudFront distribution ID

No AWS keys/secrets required with OIDC.

---

## 3) Workflow file

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Resume Site

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  id-token: write   # for OIDC
  contents: read

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    env:
      AWS_REGION: ${{ vars.AWS_REGION }}
      SITE_BUCKET: ${{ vars.SITE_BUCKET }}
      CF_DISTRIBUTION_ID: ${{ vars.CF_DISTRIBUTION_ID }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install deps
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<ACCOUNT_ID>:role/github-deploy-danpa-resume
          aws-region: ${{ env.AWS_REGION }}

      - name: Sync to S3 (site)
        run: |
          aws s3 sync dist s3://$SITE_BUCKET \
            --delete \
            --cache-control max-age=31536000,public \
            --exclude index.html
          # HTML should have short TTL so updates appear quickly
          aws s3 cp dist/index.html s3://$SITE_BUCKET/index.html \
            --cache-control max-age=60,public --content-type text/html

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id $CF_DISTRIBUTION_ID \
            --paths "/index.html" "/assets/*" "/*.js" "/*.css"

  # Optional: Assets sync (runs only when images/videos change)
  assets-sync:
    if: ${{ github.event_name == 'push' }}
    runs-on: ubuntu-latest
    needs: build-and-deploy
    env:
      AWS_REGION: ${{ vars.ASSETS_REGION }}
      ASSETS_BUCKET: ${{ vars.ASSETS_BUCKET }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<ACCOUNT_ID>:role/github-deploy-danpa-resume
          aws-region: ${{ env.AWS_REGION }}

      - name: Sync images/videos to S3
        run: |
          aws s3 sync public/images s3://$ASSETS_BUCKET/images --delete \
            --cache-control max-age=31536000,public
          aws s3 sync public/videos s3://$ASSETS_BUCKET/videos --delete \
            --cache-control max-age=31536000,public
```

Optional: Asset sync job

If you later host images/videos on an S3 assets bucket, add another job that runs only on changes under `public/images/**` or `public/videos/**` and syncs those paths to `s3://$ASSETS_BUCKET` (see the AWS deploy guide). Pair with CloudFront invalidation for the relevant paths.

---

## 4) Preview deployments for PRs (optional)

Add to `on:` section:

```yaml
  pull_request:
    branches: [ main ]
```

And modify the job to upload to `s3://$SITE_BUCKET/previews/${{ github.event.pull_request.number }}` and print a preview URL if your CloudFront is configured for origin path or Lambda@Edge rewrite. Alternatively, use GitHub Pages for previews.

---

## 5) Cache headers strategy

- Static assets (JS/CSS/png/jpg): long TTL (1 year), filenames should be hashed by Vite (default)
- `index.html`: short TTL (60–300s)
- CloudFront can use the Origin Cache Policy `CachingOptimized` and respect your object headers

---

## 6) Rollback

To rollback, re-deploy a previous artifact or restore a known-good `dist/` and push a manual “Deploy” via workflow_dispatch.

