// TODO: Pull in suggested tags
var BaseCollection = require('../collections/base.js'),
    TagModel = require('../models/tag.js'),
    Pinboard = require('../library/pinboard.js');

module.exports = BaseCollection.extend({
  name: 'tags',
  model: TagModel,

  initialize: function(data, options) {
    var self = this;
    var user = window.app.getUser();
    this.pinboard = new Pinboard(user.user, user.apiToken);

    this.getAvailable(function(){
      self.getSuggested(options.url);
    });
  },

  getAvailable: function(callback) {
    var self = this;
    self.reset();

    this.pinboard.available_tags(function(available){
      var tags = _.map(available, function(count, tag){
        return {
          tag: tag,
          count: parseInt(count, 10)
        };
      });

      self.add(tags);
      callback();
    });
  },

  getSuggested: function(url) {
    var self = this;

    this.pinboard.suggested_tags(url, function(suggested){
      var tags = _.map(suggested, function(tag){
        return {
          tag: tag,
          suggested: true
        }
      });

      var newTags = self.difference(tags);
      var updatedTags = _.difference(tags, newTags);

      self.trigger('ready');
    });
  }

});