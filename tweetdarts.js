function TweetDarts(username) {
  this.username             = username;
  this.tweetDartsClass      = "tweetdarts";
  this.scrollCounter        = 0;
  this.scrollCountMax       = 5;
  this.scrolledDown         = false;
  this.updateTimer          = undefined;
  this.supportedCollections = new Array("timeline");
}

TweetDarts.prototype.getCurrentCollection = function() {
  if ($("#global-nav-home").hasClass("active")) {
    return "timeline";
  }
  else if ($("#global-actions > li.people").hasClass("active")) {
    return "mentions";
  }
  return "";
}

TweetDarts.prototype.updateDart = function() {
  var self = this;

  if (!self._inSupportedCollection())
    return false;

  var tweetId = self._findTopmostTweet();
  if (tweetId) {
    var data = {};
    data["timeline"] = { id: tweetId };
    td._setMarker(data, function() { self.restoreDart() });
  }
}

TweetDarts.prototype.restoreDart = function() {
  var self = this;

  if (!self._inSupportedCollection())
    return false;

  self._getMarker(function(marker) {
    // console.log("got marker", marker);
    var id = marker["timeline"].id;
    var selector = self._generateTweetSelector(id);
    if (! selector)
      return false;
    $("li").removeClass(self.tweetDartsClass);
    $.each($(selector).parents(), function() {
      if(! $(this).hasClass("js-stream-item"))
        return;
      $(this).addClass(self.tweetDartsClass);
      self.setIcon("enabled");
      if (self.updateTimer)
        clearInterval(self.updateTimer);
      self.updateTimer = setInterval(function() { self.updateDart() }, 15000);
    });
  });
}

TweetDarts.prototype.moveToDart = function() {
  var self = this;

  if (!self._inSupportedCollection())
    return false;

  var selector = "li." + self.tweetDartsClass;
  var offsettop = $(window).height() - 300;
  if ($(selector).data() != null) {
    var scrollValue = $(selector).offset().top - offsettop;
    if (scrollValue < 0)
      scrollValue = 0;
    $('html,body').animate({scrollTop: scrollValue}, 250);
    self.scrolledDown = true;
    self.setIcon("enabled");
  }
  else {
    if (self.scrollCounter <= (self.scrollCountMax - 1)) {
      self.restoreDart();
      setTimeout(function() { self.moveToDart() }, 1300);
      $('html,body').animate({scrollTop: $(document).height() + 100}, 250);
      self.scrolledDown = true;
      self.scrollCounter++;
    }
    else{
      $('html,body').animate({scrollTop: 0}, 250);
      self.scrolledDown = false;
      self.scrollCounter = 0;
    }
  }
}

TweetDarts.prototype.setIcon = function(status) {
  this.__sendRequest("setIcon", {status: status});
}

TweetDarts.prototype._getMarker = function(callback) {
  this.__sendRequest("getMarker", null, callback);
}

TweetDarts.prototype._setMarker = function(marker, callback) {
  this.__sendRequest("setMarker", {marker: marker}, callback);
}

TweetDarts.prototype.__sendRequest = function(message, data, callback) {
  var request = {message: message, username: this.username, data: data};
  // console.log("sendRequest", request);
  if (callback)
    chrome.extension.sendRequest(request, callback);
  else
    chrome.extension.sendRequest(request);
}

TweetDarts.prototype._findTopmostTweet = function() {
  var tweetId;
  $("#stream-items-id > li.js-stream-item").each(function() {
    if(
      $(this).offset().top > $(window).scrollTop() + 40
      && !$(this).children().first().hasClass("promoted-tweet")
    ) {
      tweetId = $(this).find(".js-stream-tweet").attr("data-tweet-id");
      return false;
    }
  });
  return tweetId;
}

TweetDarts.prototype._generateTweetSelector = function(id) {
  var selector = 'div.js-stream-tweet.original-tweet[data-tweet-id="' + id + '"]';
  if ($(selector).data() == null)
    selector = 'div.js-stream-tweet.original-tweet[data-retweet-id="' + id + '"]';
  if ($(selector).data() == null)
    return false;
  return selector;
}

TweetDarts.prototype._inSupportedCollection = function() {
  var self = this;
  var current = self.getCurrentCollection();
  var result = ($.inArray(current, self.supportedCollections) < 0) ? false : true;
  console.log(result, current);
  return result;
}
