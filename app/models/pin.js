var _ = require('lodash'),
    BaseModel = require('./base.js'),
    Pinboard = require('../library/pinboard.js');

module.exports = BaseModel.extend({

  name: 'post',

  defaults: {
    url: null,
    description: '',
    tags: [],
    dt: new Date(),
    replace: true,
    shared: false,
    toread: false
  },

  // TODO: check for existing bookmarks
  initialize: function(callback) {
    _.bindAll(this);

    var self = this;
    var user = window.app.getUser();
    this.pinboard = new Pinboard(user.user, user.apiToken);

    this.getCurrentTitle(function(title){
      self.set('description', title);

      self.getCurrentUrl(function(url){
        self.set('url', url);
        self.trigger('ready', self);
        callback(self);
      });
    });
  },

  getCurrentUrl: function(callback) {
    if (chrome.tabs) {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        callback(tabs[0].url);
      });
    } else {
      callback(window.location.href);
    }
  },

  getCurrentTitle: function(callback) {
    if (chrome.tabs) {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        callback(tabs[0].title);
      });
    } else {
      callback(document.title || window.location.hostname);
    }
  },

  save: function(data) {
    var self = this;
    this.set(_.omit(data));

    var additionals = _.omit(this.toJSON(), 'url', 'description');

    additionals = _.map(additionals, function(value, name){
      return {
        name: name,
        value: value
      }
    });

    delete additionals.dt;

    this.pinboard.add(this.get('url'), this.get('description'), function(result){
      if (! result.result_code == 'done') return self.trigger('save:error', result);
      self.trigger('save:success');
    }, additionals);
  }

});