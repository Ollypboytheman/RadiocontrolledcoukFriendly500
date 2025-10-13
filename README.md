
# Cloudflare Custom Error Pages (Radio‑Controlled.co.uk)

A tiny static site with individual pages for common Cloudflare error scenarios (5xx and 1xxx, WAF/429 etc.) Each page loads our logo and sends a distinct analytics event to GA4 **or** GTM.

## Structure

```
/assets
  styles.css
  tracking.js
  logo.png
/pages
  500.html
  520.html
  521.html
  522.html
  523.html
  524.html
  525.html
  526.html
  530.html
  403.html
  429.html
  1000.html
```

## Configure tracking

Each page uses HTML data attributes on `<html>`:
- `data-ga-mode` = `gtag` (GA4) or `gtm` (Google Tag Manager)
- `data-ga-id`   = GA4 Measurement ID (e.g. `G-Y81T3LPS17`)
- `data-gtm-id`  = GTM container ID (e.g. `GTM-XXXXXXX`)

By default, pages are set to GA4 (`gtag`) with a placeholder ID. Search/replace across `/pages/*.html` to set your real IDs, or mix-and-match:
- Use GA4 for 5xx pages with ID `G-...`
- Use GTM for security/429 pages with ID `GTM-...`

Events:
- Event name: `cf_error_###` (e.g., `cf_error_522`)
- Parameters: `error_code`, `error_key`, `ref` plus `page_path` = `/cf-error/###`

## Publishing via GitHub Pages

1. Push this folder to a new repo, e.g. `cloudflare-error-pages`.
2. In **Settings → Pages**, choose **Deploy from a branch**, folder `/` (or `/docs`) and branch `main`.
3. Your pages will be available at:
   - `https://<user>.github.io/<repo>/pages/522.html`, etc.

## Hooking up in Cloudflare

**Option A — Custom error rules (granular per code):**
1. Cloudflare Dashboard → **Rules → Custom error pages → Create custom error rule**.
2. Condition: `Response status code equals 522` (repeat for each code you care about).
3. Custom page URL: the GitHub Pages URL, e.g. `https://<user>.github.io/<repo>/pages/522.html`.

**Option B — Error Pages (broad):**
- Assign a single page to “500 class errors” or “1000 class errors” using the Error Pages panel.
  Use `/pages/500.html` for “500 class errors” and `/pages/1000.html` for “1000 class errors”.

**Security/Rate limiting pages:**
- In the same **Custom error pages** area, map:
  - **WAF block** → `/pages/403.html`
  - **Rate limiting block** → `/pages/429.html`
  - **IP/Country block/challenge** → you can reuse `/pages/403.html` or make new ones.

> Tip: Cloudflare may restrict external assets on some challenge pages. These templates keep dependencies minimal (one image + one JS). If a specific page doesn’t load tracking (e.g. on a managed challenge), that’s by design from Cloudflare.

## Editing the look & copy

- Swap `/assets/logo.png` with a higher‑res transparent PNG if you like.
- Edit `/assets/styles.css` for colours/spacing.
- Per‑page text lives in `/pages/*.html`.

## Testing

- Open the page directly to verify layout.
- In GA4 DebugView or GTM Preview, check the `cf_error_###` event fires.
