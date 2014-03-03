// TODO: add options page
var _ = require('lodash'),
    Backbone = require('backbone'),
    $ = require('jquery')

// Setup globals
window.Backbone = Backbone;
window._ = _;
window.$ = $;
window.jQuery = $;
Backbone.$ = $;
Backbone._ = _;

var Pin = require('./views/pin.js'),
    User = require('./views/user.js');

app = {
  user: null,

  view: null,

  initialize: function () {
    var self = this;

    if (this.getUser()) {
      this.newPin();
    } else {
      this.newUser();
    }

    this.view.on('auth:success', function(){
      _.delay(self.newPin, 3000);
    });

    this.view.on('save:success', function(){
      //_.delay(self.close, 2000);
    });
  },

  newPin: function(token) {
    if (this.view && this.view.destroy) this.view.destroy();
    this.view = new Pin(token);
  },

  newUser: function() {
    if (this.view && this.view.destroy) this.view.destroy();
    this.view = new User();
  },

  close: function() {
    window.close();
  },

  getUser: function() {
    var storedUser = JSON.parse(localStorage.getItem('user'));
    if (! storedUser) return null;
    if (! storedUser.apiToken) return null;
    return storedUser;
  }
};

$(document).ready(function(){
  app.initialize();
  window.app = app;
});
