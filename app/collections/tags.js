var BaseCollection = require('../collections/base.js'),
  TagModel = require('../models/tag.js'),
  Pinboard = require('../library/pinboard.js'),
  async = require('async');

module.exports = BaseCollection.extend({
  name: 'tags',
  model: TagModel,

  initialize: function (data, options) {
    var self = this;
    var user = window.app.getUser();
    this.pinboard = new Pinboard(user.user, user.apiToken);

    async.waterfall([function (cb) {
      self.getAvailable(cb);
    }, function (results, cb) {
      self.getSuggested(options.url, cb);
    }], function () {
      self.trigger('ready');
    });
  },

  getAvailable: function (callback) {
    var self = this;
    self.reset();

    this.pinboard.available_tags(function (available) {
      var tags = _.map(available, function (count, tag) {
        return {
          tag: tag,
          count: parseInt(count, 10)
        };
      });

      self.add(tags);
      callback(null, tags);
    });
  },

  getSuggested: function (url, callback) {
    var self = this;

    this.pinboard.suggested_tags(url, function (suggested) {
      var tags = _.map(suggested, function (tag) {
        return {
          tag: tag,
          suggested: true
        }
      });

      self.suggested = tags;
      self.trigger('tags:suggested', tags);
      callback(null, tags);
    });
  }

});