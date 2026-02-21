## AWS State Overview (resume project)

Context from `aws sts get-caller-identity`:
- Account: `634072176770`
- User: `arn:aws:iam::634072176770:user/dan_admin`

### S3
- Buckets:
  - `danpa-resume-site-prod` (us-west-2) — intended for built site artifacts (`dist/`).
  - `danpa-resume-assets-prod` (us-west-2) — asset bucket for images/videos/PDF.
- Assets bucket contents (key highlights):
  - Images: `test.(jpeg|webp|avif)`, `pipeline_eng.png`, `we-1/2/3-thumb.(jpg|webp|avif)` in `images/`.
  - Videos: `we-1/2/3-clip.mp4`, `test.mp4`, `cloud.mp4`, `data_bender.mp4`, `graduation.mp4`, `mason.mp4`, `pipeline.mp4` in `videos/`.

### CloudFront
- Distributions:
  - `EM35NER047NYG` → domain `d3bk6x8tulxw2.cloudfront.net`, alias `resume.danpa.dev`, origin `danpa-resume-site-prod.s3.us-west-2.amazonaws.com` (site).
  - `E1ENJ0IO0Z0R7B` → domain `d3dh6su25xb5ps.cloudfront.net`, alias `assets.danpa.dev`, origin `danpa-resume-assets-prod.s3.us-west-2.amazonaws.com` (assets).

### DNS (as inferred)
- CNAMEs expected/observed via CloudFront aliases:
  - `resume.danpa.dev` → `d3bk6x8tulxw2.cloudfront.net` (site)
  - `assets.danpa.dev` → `d3dh6su25xb5ps.cloudfront.net` (assets)
- ACM should be in `us-east-1` covering both names (not queried here).

### Notes / gaps
- Did not retrieve S3 bucket policies, OAC configs, or TLS cert ARNs (could be queried if needed).
- No changes were made; all commands were read-only.
