
(function(){
  var html = document.documentElement;
  var mode = html.getAttribute('data-ga-mode') || 'gtag'; // 'gtag' or 'gtm'
  var gaId = html.getAttribute('data-ga-id') || '';
  var gtmId = html.getAttribute('data-gtm-id') || '';
  var payload = (window.__cf_err) || {};
  var pagePath = '/cf-error/' + (payload.code || 'unknown');
  var eventName = 'cf_error_' + (payload.code || 'unknown');

  function inject(src, isModule){
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if(isModule) s.type='module';
    document.head.appendChild(s);
  }

  if(mode === 'gtag' && gaId){
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    inject('https://www.googletagmanager.com/gtag/js?id=' + gaId);
    gtag('js', new Date());
    gtag('config', gaId, { 'page_path': pagePath });
    gtag('event', eventName, {
      'error_code': payload.code,
      'error_key': payload.key,
      'ref': payload.ref
    });
  } else if(mode === 'gtm' && gtmId){
    window.dataLayer = window.dataLayer || [];
    dataLayer.push({
      'event': eventName,
      'cf_error_code': payload.code,
      'cf_error_key': payload.key,
      'cf_error_ref': payload.ref,
      'page_path': pagePath
    });
    (function(w,d,s,l,i){ w[l]=w[l]||[]; w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
      j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', gtmId);
  } else {
    // no tracking
  }
})();
