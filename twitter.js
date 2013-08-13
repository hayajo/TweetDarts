function Twitter(consumer_key, consumer_secret) {
  this.oauth = ChromeExOAuth.initBackgroundPage({
    'request_url': "https://api.twitter.com/oauth/request_token",
    'authorize_url': "https://api.twitter.com/oauth/authorize",
    'access_url': "https://api.twitter.com/oauth/access_token",
    'consumer_key': consumer_key,
    'consumer_secret': consumer_secret
  });
  this.authorizationHeader = null;
  this.username = null;
}

Twitter.prototype.authorize = function(callback) {
  var self = this;
  this.oauth.authorize(function () {
    var url = "https://api.twitter.com/1.1/account/settings.json";
    var request = { method: 'GET' };
    self.oauth.sendSignedRequest(url, function(response) {
      var data = JSON.parse(response);
      self.username = data.screen_name;
      self.authorizationHeader = self.oauth.getAuthorizationHeader();
      if (callback) {
        callback();
      }
    }, request);
  });
}

Twitter.prototype.unauthorize = function() {
  this.oauth.clearTokens();
}
