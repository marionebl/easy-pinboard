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
    toread: false,
    time: null,
    existing: false
  },

  initialize: function(callback) {
    _.bindAll(this);

    var self = this;
    var user = window.app.getUser();
    this.pinboard = new Pinboard(user.user, user.apiToken);


    this.getCurrentTitle(function(title){
      self.set('description', title);
    });

    this.getCurrentUrl(function(url){
      self.set('url', url);

      self.getExisting(url, function(){});
    });

    callback(this);
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

  getExisting: function(url, callback) {
    var self = this;

    this.pinboard.get(url, function(response){
      if (response.posts && response.posts.length > 0) {
        var post = response.posts[0];

        post.toread = post.toread == 'yes';
        post.shared = post.shared == 'yes';
        post.tags = post.tags.split(' ');
        post.existing = true;

        self.set(post);
      }
      callback(post);
    });
  },

  save: function(data) {
    var self = this;
    var additionals = _.omit(data, 'url', 'description');

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