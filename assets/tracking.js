(function(){
  var html = document.documentElement;
  var mode = html.getAttribute('data-ga-mode') || 'gtm';
  var gtmId = html.getAttribute('data-gtm-id') || '';
  var payload = (window.__cf_err) || {};
  var code = (payload.code || 'unknown');
  var pagePath = '/friendly_errors/' + code;
  var pageTitle = 'friendly_errors ' + code;
  var eventName = 'cf_error_' + code;

  // Always prepare the dataLayer first
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'page_view',
    'page_path': pagePath,
    'page_location': pagePath,  // GA4 event tag can map this to page_location or use a field override
    'page_title': pageTitle,
    'cf_error_code': payload.code,
    'cf_error_key': payload.key,
    'cf_error_ref': payload.ref
  });

  // Also push a specific error event for extra tagging/alerts
  window.dataLayer.push({
    'event': eventName,
    'cf_error_code': payload.code,
    'cf_error_key': payload.key,
    'cf_error_ref': payload.ref,
    'page_path': pagePath
  });

  // Load GTM if requested
  if(mode === 'gtm' && gtmId){
    (function(w,d,s,l,i){ 
      w[l]=w[l]||[]; 
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
      j.async=true; 
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; 
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', gtmId);
  }
})();
