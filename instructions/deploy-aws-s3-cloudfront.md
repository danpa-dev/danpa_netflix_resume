## Goal

Deploy this Vite/React static site behind AWS CloudFront with S3 origins, wire it to your Squarespace-managed domain, and serve external images/videos from a private S3 bucket via CloudFront. Target URL: make the resume publicly accessible at `resume.danpa.dev` (recommended). All assets will live at `assets.danpa.dev` (us-west-2).

## Important constraint up front

- **DNS cannot route by path**. If your root site is served by Squarespace at `danpa.dev`, you cannot directly “point” the path `/resume` to a different origin (CloudFront) using DNS alone. You have two realistic choices:
  - **Recommended**: Launch the resume at `resume.danpa.dev` and add a Squarespace page at `/resume` with a 301 redirect to `https://resume.danpa.dev`.
  - Advanced/Not recommended: Put CloudFront in front of Squarespace and route `/resume` to S3 while proxying other paths to Squarespace. Squarespace isn’t designed to be an origin behind a third-party CDN in this way and support is limited.

The rest of this guide uses the recommended subdomain approach.

## Architecture overview

- One CloudFront distribution for the built app (origin: S3 "site" bucket with OAC)
- One CloudFront distribution for external assets (origin: S3 "assets" bucket with OAC)
- TLS via ACM certificate in `us-east-1` for both `resume.danpa.dev` and `assets.danpa.dev`
- Squarespace DNS hosts: add CNAMEs pointing subdomains to the CloudFront distributions

### Buckets
- `danpa-resume-site-prod` (private; built files from `dist/`, region `us-west-2`)
- `danpa-resume-assets-prod` (private; images/videos referenced by section files in `src/data/`, region `us-west-2`)

## 1) Build and structure the app

If you deploy to a subdomain (e.g., `resume.danpa.dev`), you don’t need a custom base path. If you insist on a path like `/resume` at the same domain, you must set Vite’s base:

```ts
// vite.config.ts
export default defineConfig({
  base: '/resume/',
  // ...
});
```

Build locally:

```bash
npm ci
npm run build
# output in dist/
```

## 2) Create S3 buckets (both in us-west-2)

```bash
SITE_REGION=us-west-2
ASSETS_REGION=us-west-2
SITE_BUCKET=danpa-resume-site-prod
ASSETS_BUCKET=danpa-resume-assets-prod

aws s3api create-bucket \
  --bucket "$SITE_BUCKET" \
  --region $SITE_REGION \
  --create-bucket-configuration LocationConstraint=$SITE_REGION

aws s3api create-bucket \
  --bucket "$ASSETS_BUCKET" \
  --region $ASSETS_REGION \
  --create-bucket-configuration LocationConstraint=$ASSETS_REGION

# Block all public access on both buckets (CloudFront OAC will be used)
aws s3api put-public-access-block --bucket "$SITE_BUCKET" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-public-access-block --bucket "$ASSETS_BUCKET" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

Upload content:

```bash
# Site build
aws s3 sync ./dist s3://$SITE_BUCKET --delete --cache-control max-age=31536000,public --region $SITE_REGION

# External assets (images/videos you reference from section files)
# Suggested folder layout in the assets bucket
#   /images/*  /videos/*  /pdf/*
aws s3 sync ./public/images s3://$ASSETS_BUCKET/images --cache-control max-age=31536000,public --region $ASSETS_REGION
aws s3 sync ./public/videos s3://$ASSETS_BUCKET/videos --cache-control max-age=31536000,public --region $ASSETS_REGION
aws s3 cp ./public/DanParkResume.pdf s3://$ASSETS_BUCKET/pdf/DanParkResume.pdf --cache-control max-age=31536000,public --region $ASSETS_REGION
```

## 3) Request TLS certificates (ACM)

Create a certificate in `us-east-1` for `resume.danpa.dev` and `assets.danpa.dev`. ACM for CloudFront must be in `us-east-1`. ACM will provide DNS CNAMEs you must add in Squarespace DNS. Wait until the cert is issued.

## 4) Create CloudFront distributions

### What CloudFront is (and why use it)
- CloudFront is Amazon’s global Content Delivery Network (CDN). It runs edge locations worldwide that cache content closer to users, reducing latency and offloading S3.
- Benefits: faster loads, TLS with ACM, fine-grained cache and headers, and secure private-bucket access via OAC.

Create two distributions (one per bucket). Use **Origin Access Control (OAC)** and attach bucket policies so only CloudFront can read.

Key settings for both (Console):
- Origin domain: select the S3 bucket (not website endpoint)
- Origin access: OAC (create new if needed)
- Viewer protocol policy: Redirect HTTP to HTTPS
- Cache policy: `CachingOptimized` as a baseline
- Compression: On (gzip + brotli)
- Price class: default is fine to start
- Alternate domain name (CNAME): `resume.danpa.dev` (site) or `assets.danpa.dev` (assets)
- Custom SSL: choose the ACM cert you issued (must be in us-east-1 for CloudFront)

Site distribution specifics:
- Default behavior: GET/HEAD
- Custom error responses: map 403 and 404 to `/index.html` → HTTP 200 (SPA refresh/deep links)

Assets distribution specifics:
- Methods: GET/HEAD
- Optional Response Headers Policy: add CORS if you ever fetch via XHR/canvas; not needed for simple <img>/<video>.

Additional SPA setting for the site distribution:
- Custom error responses: map 403 and 404 to `/index.html` with HTTP 200 (so client-side routing or refresh works).

### Bucket policy template (replace `<DISTRIBUTION_ID>` & bucket name)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::danpa-resume-site-prod",
        "arn:aws:s3:::danpa-resume-site-prod/*"
      ],
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/<DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
```

Repeat for the assets bucket (`danpa-resume-assets-prod`). The console can generate these automatically when you attach an OAC.

### Optional CORS for the assets bucket

This allows your web app to fetch images/videos via the assets domain.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://resume.danpa.dev"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 300
  }
]
```

## 5) DNS with Squarespace (and when to use Route53)

Squarespace is your DNS host today. You can stay on Squarespace DNS; you do not need Route53 unless you want to move all DNS to AWS. Add CNAME records in Squarespace:

- **Name**: `resume` → **Value**: your CloudFront site distribution domain (e.g., `dxxxx.cloudfront.net`)
- **Name**: `assets` → **Value**: your CloudFront assets distribution domain (e.g., `dyyyy.cloudfront.net`)

ACM validation CNAMEs must also be added (from step 3). Wait for certificate issuance and CloudFront to deploy. If you later move DNS to Route53, you would recreate these CNAMEs there; functionality is identical.

## 6) Point your section files to assets

In `src/data/*.json`, change URLs to absolute asset URLs (after CloudFront is live):

```json
{
  "metadata": {
    "defaults": {
      "thumbnailUrl": "https://assets.danpa.dev/images/test.jpeg",
      "videoUrlMp4": "https://assets.danpa.dev/videos/test.mp4",
      "videoPosterUrl": "https://assets.danpa.dev/images/test.jpeg",
      "hero": { "imageUrl": "https://assets.danpa.dev/images/test.jpeg" }
    }
  }
}
```

Rebuild and redeploy the site bucket after content changes.

## 7) Deploy updates

```bash
npm run build
aws s3 sync ./dist s3://$SITE_BUCKET --delete --region $SITE_REGION
aws cloudfront create-invalidation --distribution-id <SITE_DISTRIBUTION_ID> --paths "/*"
```

For asset updates:

```bash
aws s3 sync ./public/images s3://$ASSETS_BUCKET/images --delete --region $ASSETS_REGION
aws s3 sync ./public/videos s3://$ASSETS_BUCKET/videos --delete --region $ASSETS_REGION
aws cloudfront create-invalidation --distribution-id <ASSETS_DISTRIBUTION_ID> --paths "/images/*" "/videos/*"
```

## 8) Add `/resume` redirect (optional)

In Squarespace, create a page at `/resume` and set a permanent redirect to `https://resume.danpa.dev`. This provides the desired path while keeping the architecture simple and robust.

## 9) Should I deploy manually first or go straight to automation?

- Recommended path: do ONE manual deploy end-to-end first (S3 upload, CloudFront, DNS). This validates your configuration and TLS before wiring CI/CD. Then enable GitHub Actions (OIDC) for automated deploys.
- If you’re comfortable with AWS + Actions, you can go straight to automation; troubleshooting is just a bit trickier the first time.

## 10) Verification checklist

- `https://resume.danpa.dev` serves the site over HTTPS
- `https://assets.danpa.dev/images/test.jpeg` loads (private S3 via OAC + CloudFront)
- Refresh on any route works (custom error mapping to `index.html`)
- Lighthouse performance/accessibility ≥ 90
- Headers show long max-age + immutable for static assets; HTML has short TTL if desired

## Troubleshooting

- **403 from S3**: Ensure OAC is set and bucket policy allows the distribution ARN.
- **CORS errors for images**: Add/adjust S3 CORS to allow GET/HEAD from your site origin.
- **DNS not resolving**: Check CNAMEs in Squarespace and wait for propagation; ACM must be issued.
- **Assets not updating**: Run CloudFront invalidation after syncing.
