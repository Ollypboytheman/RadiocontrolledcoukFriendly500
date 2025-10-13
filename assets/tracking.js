/* tracking.js — self-contained GTM tracking for Cloudflare friendly error pages
   - No HTML edits required
   - Hardcoded GTM container: GTM-5QQ76VB
   - Sends virtual page_view to /friendly_errors/{code}
   - Also sends cf_error_{code} event with details
*/
(function () {
  var GTM_ID = 'GTM-5QQ76VB';

  // Try to discover the error code:
  // 1) from window.__cf_err (set by the page inline script in the bundle)
  // 2) from URL like /pages/522.html or /522.html
  // 3) fallback to 'unknown'
  function getErrorContext() {
    var ctx = (window.__cf_err && typeof window.__cf_err === 'object') ? window.__cf_err : {};
    var code = ctx.code;

    if (!code) {
      var m = (location.pathname || '').match(/(\d{3,4})\.html(?:$|\?)/) || (location.pathname || '').match(/\/(\d{3,4})(?:\/|$)/);
      code = m ? m[1] : 'unknown';
    }

    return {
      code: code,
      key: ctx.key || '',
      ref: ctx.ref || '',
      ts:  ctx.ts  || new Date().toISOString()
    };
  }

  // Ensure one GTM load
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

  var ctx = getErrorContext();
  var code = ctx.code;
  var pagePath = '/friendly_errors/' + code;
  var pageTitle = 'friendly_errors ' + code;
  var eventName = 'cf_error_' + code;

  // Prepare dataLayer and push virtual pageview + specific error event
  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: 'page_view',
    page_path: pagePath,
    page_location: pagePath, // map via tag settings if needed
    page_title: pageTitle,
    cf_error_code: ctx.code,
    cf_error_key: ctx.key,
    cf_error_ref: ctx.ref,
    cf_error_ts: ctx.ts
  });

  window.dataLayer.push({
    event: eventName,
    cf_error_code: ctx.code,
    cf_error_key: ctx.key,
    cf_error_ref: ctx.ref,
    page_path: pagePath
  });

  // Load GTM (hardcoded container)
  loadGTM(GTM_ID);
})();
