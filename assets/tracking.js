/* tracking.js — GTM tracking for Cloudflare friendly error pages
   - No HTML edits required
   - Hardcoded GTM container: GTM-5QQ76VB
   - Captures the ACTUAL failing URL from window.location
   - Also captures document.referrer (previous page) and CF Ray ID (if present)
   - Sends a virtual page_view to /friendly_errors/{code}
   - Sends a dedicated cf_error_{code} event
*/
(function () {
  var GTM_ID = 'GTM-5QQ76VB';

  // --- Discover error context ------------------------------------------------
  function getErrorContext() {
    var ctx = (window.__cf_err && typeof window.__cf_err === 'object') ? window.__cf_err : {};
    var code = ctx.code;

    if (!code) {
      // Infer code from URL like /pages/522.html or /522.html
      var m = (location.pathname || '').match(/(\d{3,4})\.html(?:$|\?)/) ||
              (location.pathname || '').match(/\/(\d{3,4})(?:\/|$)/);
      code = m ? m[1] : 'unknown';
    }

    return {
      code: code,
      key:  ctx.key || '',
      ref:  ctx.ref || '',
      ts:   ctx.ts  || new Date().toISOString()
    };
  }

  // --- Try to extract a Cloudflare Ray ID if Cloudflare renders one ----------
  function getCfRay() {
    // Common ids/classes in CF boxes (best-effort)
    var el = document.querySelector('#cf-ray, .cf-error-details #cf-ray, .ray-id, [data-cf-ray]');
    if (el && (el.textContent || '').trim()) return (el.textContent || '').trim();

    // Last resort: scan visible text for “Ray ID: XXXXX”
    try {
      var txt = (document.body.innerText || '').slice(0, 5000);
      var m = txt.match(/Ray ID[:\s]+([A-Za-z0-9\-]+)/i);
      return m ? m[1] : '';
    } catch(e) {
      return '';
    }
  }

  // --- Load GTM once ---------------------------------------------------------
  function gtmAlreadyLoaded() {
    return !!document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
  }
  function loadGTM(id) {
    if (gtmAlreadyLoaded()) return;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', id);
  }

  // --- Build data and push ---------------------------------------------------
  var ctx = getErrorContext();
  var code = ctx.code || 'unknown';

  // The failing URL is the current location (CF serves the page at the failing URL)
  var failingUrl  = window.location.href;
  var failingPath = window.location.pathname + window.location.search;
  var previousReferrer = document.referrer || '';
  var cfRay = getCfRay();

  var friendlyPath  = '/friendly_errors/' + code;
  var friendlyTitle = 'friendly_errors ' + code;
  var errorEvent    = 'cf_error_' + code;

  window.dataLayer = window.dataLayer || [];

  // Virtual pageview for error rollups
  window.dataLayer.push({
    event: 'page_view',
    page_path: friendlyPath,
    page_location: failingUrl,     // so GA4 can record the real URL if you map it
    page_title: friendlyTitle,
    // Error context
    cf_error_code: ctx.code,
    cf_error_key:  ctx.key,
    cf_error_ref:  ctx.ref,
    cf_error_ts:   ctx.ts,
    cf_ray:        cfRay,
    // Originals
    original_url:  failingUrl,
    original_path: failingPath,
    previous_referrer: previousReferrer
  });

  // Dedicated error event for alerts/segmentation
  window.dataLayer.push({
    event: errorEvent,
    cf_error_code: ctx.code,
    cf_error_key:  ctx.key,
    cf_error_ref:  ctx.ref,
    cf_error_ts:   ctx.ts,
    cf_ray:        cfRay,
    original_url:  failingUrl,
    original_path: failingPath
  });

  // Load GTM container
  loadGTM(GTM_ID);
})();
