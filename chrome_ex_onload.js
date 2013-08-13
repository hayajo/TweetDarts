$(window).load( function() {
  try {
    ChromeExOAuth.initCallbackPage();
    var param, queries = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < query.length; i++) {
      param = queries[i].split('=');
      if (param[0] === "denied") {
        throw new Error("Authentication denied");
      }
    }
  }
  catch(e) {
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.get(tab.openerTabId, function (authTab) {
        chrome.tabs.remove(authTab.id);
        chrome.tabs.remove(tab.id);
      });
    });
  }
} );
