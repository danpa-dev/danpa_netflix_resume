## CloudFront Basics (Beginner-Friendly)

This guide explains what Amazon CloudFront is, why you’d use it, and the major settings you’ll see when creating a distribution. It ties into the deployment steps in `instructions/deploy-aws-s3-cloudfront.md` and CI/CD in `instructions/github-actions-deploy.md`.

### What is CloudFront?
- CloudFront is Amazon’s global Content Delivery Network (CDN). It has many “edge locations” around the world that cache your content closer to users.
- Why it matters: lower latency (faster loads), fewer origin hits (S3 does less work), and easy HTTPS with AWS Certificate Manager (ACM).
- Typical setup for a static site:
  - Site distribution → serves your built app from an S3 site bucket
  - Assets distribution → serves images/videos/PDF from an S3 assets bucket
  - Both buckets stay private; CloudFront reads them using Origin Access Control (OAC)

### Key Concepts
- **Origin**: Where CloudFront fetches the content from (e.g., private S3 bucket with OAC).
- **Behavior**: Rules that define how CloudFront caches/serves requests (methods, cache policy, redirects, compression, etc.). You can have multiple behaviors using path patterns (e.g., `/images/*`).
- **Alternate Domain Names (CNAMEs)**: Friendly hostnames you own, like `resume.danpa.dev` or `assets.danpa.dev`.
- **TLS/Certificate (ACM)**: Needed to serve HTTPS on your custom domain. CloudFront requires the certificate to be in `us-east-1`.
- **OAC (Origin Access Control)**: Lets CloudFront securely access private S3 content; S3 bucket blocks public access.
- **Invalidation**: Clears cached objects at the edge when you deploy changes.

---

## Major Settings You’ll See

### 1) Alternate Domain Names (CNAMEs)
- Purpose: So your distribution answers on `resume.danpa.dev` (site) and `assets.danpa.dev` (assets) instead of the default `dXXXX.cloudfront.net`.
- Requirements: An ACM certificate in `us-east-1` that covers those names.
- Steps (high-level):
  1. Request ACM cert in `us-east-1` for `resume.danpa.dev` and `assets.danpa.dev` (DNS validation).
  2. Add the validation CNAMEs in your DNS (Squarespace). Wait until the cert status is “Issued”.
  3. In the CloudFront distribution, set “Alternate domain name (CNAME)” to your domain(s) and select the ACM cert.
  4. In DNS, add CNAMEs that point `resume`/`assets` to the CloudFront domain (`dXXXX.cloudfront.net`).
- Notes: Trailing dots in AWS examples are normal FQDN notation; Squarespace generally doesn’t require them.

### 2) Origin
- Choose the S3 bucket as the origin domain (not the “static website hosting” endpoint).
- Enable **Origin Access Control (OAC)** and attach the generated policy so only CloudFront can read from S3.
- Keep the S3 buckets private (block public access on).
- Region: both site and assets buckets are in `us-west-2` per our plan (it’s fine that ACM is in `us-east-1`).

### 3) Behavior
- Default behavior covers all paths unless you add more specific ones.
- Common options:
  - Allowed methods: GET, HEAD for static sites
  - Viewer protocol policy: Redirect HTTP to HTTPS (forces TLS)
  - Cache policy: Start with `CachingOptimized` (good defaults)
  - Compression: Turn on (Brotli + gzip)
  - Functionality for SPAs: add custom error responses mapping 403/404 to `/index.html` (HTTP 200) on the site distribution so refresh/deep links work.
  - TTLs: Use long TTLs for hashed assets (`.js`, `.css`, images), short TTL for HTML (we also upload `index.html` with short cache headers).
- Advanced (optional later):
  - Path-based behaviors (e.g., `/images/*` vs `/videos/*`)
  - Response/Origin request policies to forward specific headers/cookies/query strings when needed

### 4) Security – Web Application Firewall (WAF)
- CloudFront integrates with AWS WAF to filter/mitigate attacks (e.g., common exploits, bot **traffic**, IP blocking).
- Typical steps:
  1. Create a WAF web ACL (start with AWS Managed Rules for common protections).
  2. Associate the web ACL with your CloudFront distribution.
  3. Tune rules over time (observe false positives in logs). Costs apply.
- Other security best practices:
  - HTTPS-only (enforced via viewer protocol policy)
  - Minimum TLS version (use modern default)
  - Keep S3 private with OAC
  - Signed URLs/cookies (only if you need restricted content)

### 5) Continuous Deployment
- You generally don’t “redeploy CloudFront.” You deploy to S3 and then invalidate cache.
- Recommended pipeline (we provide an example workflow):
  - GitHub Actions builds the site → syncs `dist/` to the site bucket (us-west-2)
  - Optionally sync images/videos to the assets bucket
  - Create a CloudFront invalidation for `index.html` and new asset paths
- Tips:
  - Vite hashes asset filenames → browsers and CloudFront cache aggressively without cache-busting.
  - Keep `index.html` with short TTL; it references new hashed assets automatically.
  - Use OIDC-based GitHub Actions (no static AWS keys) as shown in `instructions/github-actions-deploy.md`.

---

## Putting It Together for This Project
- Two distributions: one for site, one for assets.
- Two private buckets in `us-west-2` with OAC.
- ACM certificate in `us-east-1` for `resume.danpa.dev` and `assets.danpa.dev`.
- Squarespace DNS: CNAME `resume` → site distribution domain; CNAME `assets` → assets distribution domain; plus ACM validation CNAMEs.
- Behaviors: GET/HEAD, Redirect HTTP→HTTPS, compression on, caching policy defaults; custom error responses for SPA on the site distribution.
- CI/CD: build, sync to S3, invalidate CloudFront; optional separate job for assets.

For step-by-step creation and exact commands, see `instructions/deploy-aws-s3-cloudfront.md`. For automated deployments, see `instructions/github-actions-deploy.md`.

