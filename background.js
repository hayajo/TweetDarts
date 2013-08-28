// api authentication

var TWITTER_CONSUMER_KEY    = "your consumer_key";
var TWITTER_CONSUMER_SECRET = "your consumer_secret";
var TWEETMARKER_API_KEY     = "your api_key";

// initialize

var twitter = new Twitter(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET);
var tm; twitter.authorize(function() {
  tm = new TweetMarker(TWEETMARKER_API_KEY, twitter);
  tm.fetchMarker();
});

function _setIcon(sender, status) {
  switch(status) {
    case "enabled":
      chrome.pageAction.setIcon({tabId: sender.tab.id, path: "img/tweetdarts-page_action-enabled.png"});
      break;
    case "disabled":
      chrome.pageAction.setIcon({tabId: sender.tab.id, path: "img/tweetdarts-page_action-disabled.png"});
      break;
    case "warning":
      chrome.pageAction.setIcon({tabId: sender.tab.id, path: "img/tweetdarts-page_action-warning.png"});
      break;
  }
}

// listeners

chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
  if (! (tab.url.indexOf('twitter.com') > -1)) {
      chrome.pageAction.hide(tabId);
      return;
  }
  chrome.pageAction.show(tabId); // show icon
} );

chrome.pageAction.onClicked.addListener( function(tab) {
  chrome.tabs.sendRequest(tab.id, {message: "click"});
} );

chrome.extension.onRequest.addListener( function(request, sender, response) {
  console.log("onRequest", request);
  if (request.username !== twitter.username) {
    return false;
  }
  switch(request.message) {
    case "setIcon":
      _setIcon(sender, request.data.status);
      break;
    case "getMarker":
      tm.fetchMarker(
        function() {},
        function() {
          _setIcon(sender, "warning");
        },
        function() { response(tm.marker) }
      );
      break;
    case "setMarker":
      tm.pushMarker(
        request.data.marker,
        function() {},
        function() {
          _setIcon(sender, "warning");
        },
        function() { response(tm.marker) }
      );
      break;
    case "reAuthorize":
      twitter.unauthorize();
      twitter.authorize(function() {
        tm.twitter = twitter;
      });
      break;
  }
} );
