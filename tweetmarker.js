function TweetMarker(api_key, objTwitter) {
  this.api_key = api_key;
  this.twitter = objTwitter;
  if ( ! this._is_authorized() ) {
    throw "not yet authorized";
  }
  this._api_url = "https://api.tweetmarker.net/v2/lastread";
  this._lastQueryTime = {
    push: null,
    fetch: null
  };
  this.marker = {
    timeline: { id: 0, version: 0 },
  };
}

TweetMarker.prototype.fetchMarker = function(handle_success, handle_error, handle_complete) {
  var self = this;

  $.ajax({
    type: "GET",
    url: self._api_url + "?collection=timeline&username=" + self.twitter.username + "&api_key=" + self.api_key,
    dataType: "json",
    beforeSend: function(xhr) {
      if (self._can_request(self._lastQueryTime.fetch, 180)) {
        return true;
      }
      console.warn("fetchMarker", self.twitter.username, "too many queries. please try again later");
      setTimeout(function() {
        if (handle_complete)
          handle_complete();
      }, 0);
      return false;
    },
    success: function(data) {
      self._setMarker(data);
      self._lastQueryTime.fetch = new Date();
      if (handle_success)
        handle_success();
    },
    error: function(xhr, text, exception) {
      console.error("fetchMarker", exception);
      if (handle_error)
        handle_error(text, exception);
    },
    complete: function() {
      if (handle_complete)
        handle_complete();
    }
  })
}

TweetMarker.prototype.pushMarker = function(data, handle_success, handle_error, handle_complete) {
  var self = this;

  // update attribute before post
  self._setMarker(data);

  $.ajax({
    type: "POST",
    url: self._api_url + "?username=" + self.twitter.username + "&api_key=" + self.api_key,
    data: JSON.stringify(self.marker),
    headers: {
      "X-Auth-Service-Provider": "https://api.twitter.com/1/account/verify_credentials.json",
      "X-Verify-Credentials-Authorization": self.twitter.authorizationHeader
    },
    beforeSend: function() {
      if (self._can_request(self._lastQueryTime.push, 10)) {
        return true;
      }
      console.warn("pushMarker", self.twitter.username, "too many queries. please try again later");
      setTimeout(function() {
        if (handle_complete)
          handle_complete();
      }, 0);
      return false;
    },
    success: function(data) {
      self._lastQueryTime.push = new Date();
      if (handle_success)
        handle_success();
    },
    error: function(xhr, text, exception) {
      console.error("pushMarker", exception);
      if (handle_error)
        handle_error(text, exception);
    },
    complete: function() {
      if (handle_complete)
        handle_complete();
    }
  });
}

TweetMarker.prototype._is_authorized = function() {
  return (this.twitter.username) ? true : false;
}

TweetMarker.prototype._can_request = function(lastQueryTime, cycle) {
  if (! lastQueryTime)
    return true;
  var now = new Date();
  var diff = ( now.getTime() - lastQueryTime.getTime() ) / 1000; // sec
  console.log(lastQueryTime, cycle, diff);
  return (diff >= cycle) ? true : false;
}

TweetMarker.prototype._setMarker = function(data) {
  if (data.timeline) {
    if (data.timeline.version && data.timeline.version > this.marker.timeline.version) {
      this.marker.timeline.version = data.timeline.version;
    }
    this.marker.timeline.id = data.timeline.id;
  }
}
