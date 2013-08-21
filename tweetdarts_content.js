// initialize

var td;

function onLoad() {
  var username = getUsername();
  if (username) {
    td = new TweetDarts(username);
    td.restoreDart();
  }
}

function getUsername() {
  return $.trim($("div.js-mini-current-user").attr("data-screen-name"));
}

// listeners

chrome.extension.onRequest.addListener(function(request, sender) {
  // console.log("onRequest", request);
  switch(request.message) {
    case "click":
      td.moveToDart();
    break;
  }
});

$(document).keyup(function(event) {
  var active = this.activeElement;
  if (active.nodeName.toLowerCase() == "input" || $(active).hasClass("rich-editor"))
    return;
  if(event.which == 89 || event.which == 189) { // "y", "-"
    td.updateDart();
  } else if(event.which == 188) { // ",", "<"
    td.moveToDart();
  }
});


// start -----------------------------------------------------------------------

$(window).load(function() { onLoad() });
