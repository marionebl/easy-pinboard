var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery'),
    TagModel = require('../models/tag.js');

module.exports = Backbone.View.extend({

  tagName: 'option',

  initialize: function(data){
    _.bindAll(this);

    // CollectionView screws this up I guess
    this.model = new TagModel(data).get('model');
    this.model.on('change:selected', this.onSelectChange);

    this.render();
  },

  render: function() {
    if (! this.model.get('tag')) return;

    var text = this.model.get('tag');
    var append = (this.model.get('suggested')) ? '★' : this.model.get('count');

    this.$el.attr('data-count', append);
    this.$el.attr('selected', this.model.get('isNew') || this.model.get('selected'));
    this.$el.text(text);
  },

  destroy: function() {
    this.$el.remove();
  },

  onSelectChange: function(model, value) {
    this.$el.prop('selected', value);
  }
});