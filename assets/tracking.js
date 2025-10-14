/* tracking.js — GTM tracking for Cloudflare friendly error pages
   - No HTML edits required
   - Hardcoded GTM container: GTM-5QQ76VB
   - Uses the REAL browser URL/path (the failed page) for page_view
   - Adds custom vars: page_type=error, error_type=friendly_error_page, error_code=###
   - Also captures document.referrer and CF Ray (if present)
   - Sends a dedicated cf_error_{code} event
*/
(function () {
  var GTM_ID = 'GTM-5QQ76VB';

  // --- Discover error context ------------------------------------------------
  function getErrorContext() {
    var ctx  = (window.__cf_err && typeof window.__cf_err === 'object') ? window.__cf_err : {};
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
    var el = document.querySelector('#cf-ray, .cf-error-details #cf-ray, .ray-id, [data-cf-ray]');
    if (el && (el.textContent || '').trim()) return (el.textContent || '').trim();
    try {
      var txt = (document.body.innerText || '').slice(0, 5000);
      var m = txt.match(/Ray ID[:\s]+([A-Za-z0-9\-]+)/i);
      return m ? m[1] : '';
    } catch(e) { return ''; }
  }

  // --- Load GTM once ---------------------------------------------------------
  function gtmAlreadyLoaded() {
    return !!document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
  }
  function loadGTM(id) {
    if (gtmAlreadyLoaded()) return;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event:'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l!='dataLayer' ? '&l='+l : '';
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', id);
  }

  // --- Build data and push ---------------------------------------------------
  var ctx = getErrorContext();
  var code = ctx.code || 'unknown';

  // The failing URL is the current location (CF serves the page at the failing URL)
  var failingUrl   = window.location.href;
  var failingPath  = window.location.pathname + window.location.search;
  var prevReferrer = document.referrer || '';
  var cfRay        = getCfRay();

  var pageType  = 'error';
  var errorType = 'friendly_error_page';
  var errorEvt  = 'cf_error_' + code;

  window.dataLayer = window.dataLayer || [];

  // GA4 virtual pageview using REAL browser URL/path
  window.dataLayer.push({
    event: 'page_view',
    page_location: failingUrl,
    page_path: failingPath,
    page_title: 'Error ' + code,
    // Custom variables for GTM/GA4 (map to custom dims if desired)
    page_type: pageType,
    error_type: errorType,
    error_code: code,
    // Error context
    cf_error_code: code,
    cf_error_key:  ctx.key,
    cf_error_ref:  ctx.ref,
    cf_error_ts:   ctx.ts,
    cf_ray:        cfRay,
    // Provenance
    previous_referrer: prevReferrer
  });

  // Dedicated error event for alerting/segmentation
  window.dataLayer.push({
    event: errorEvt,
    page_location: failingUrl,
    page_path: failingPath,
    page_type: pageType,
    error_type: errorType,
    error_code: code,
    cf_error_code: code,
    cf_error_key:  ctx.key,
    cf_error_ref:  ctx.ref,
    cf_error_ts:   ctx.ts,
    cf_ray:        cfRay
  });

  // Load GTM container
  loadGTM(GTM_ID);
})();
