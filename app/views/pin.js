var Backbone = require('backbone'),
    $ = require('jquery');
    Pinboard = require('../library/pinboard.js'),
    PinModel = require('../models/pin.js'),
    PinTemplate = require('../templates/pin.hbs'),
    TagCollection = require('../collections/tags'),
    TagsView = require('../views/tags.js'),
    Message = require('../views/message.js');

module.exports = Backbone.View.extend({

  tagName: 'form',

  attributes: {
    name: 'pin'
  },

  events: {
    'focus input[type="text"]': 'onInputFocus',
    'focus input[type="checkbox"]': 'onCheckboxFocus',
    'blur input[type="checkbox"]': 'onCheckboxBlur',
    'keydown input[type="checkbox"]': 'onCheckboxEnter',
    'submit': 'onSubmit'
  },

  messages: [],

  initialize: function(){
    var self = this;

    this.bindMethods();

    new PinModel(function(model){
      self.model = model;
      self.listen();
      self.render();

      self.tags = new TagsView({
        collection: new TagCollection({}, { url: model.get('url')})
      });

      self.tags.render();

      self.tags.collection.on('ready', function(){
        self.tags.chosen();
      });
    });
  },

  bindMethods: function() {
    _.bindAll(this)
  },

  listen: function() {
    this.model.on('save:error', this.onError);
    this.model.on('save:success', this.onSuccess);
  },

  render: function() {
    this.el.innerHTML = PinTemplate(this.model.toJSON());
    $('body').html(this.el);
  },

  destroy: function() {
    this.$el.remove();
  },

  onInputFocus: function(e) {
    var target = e.target;

    _.delay(function(){
      target.setSelectionRange(target.value.length, target.value.length);
      target.scrollLeft = self.scrollWidth;
    }, 1);
  },

  onCheckboxFocus: function(e) {
    $(e.target).parent().addClass('focused');
  },

  onCheckboxBlur: function(e) {
    $(e.target).parent().removeClass('focused');
  },

  onCheckboxEnter: function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      e.stopPropagation();
      $(e.target).prop('checked', ! $(e.target).prop('checked'));
    }
  },

  onSubmit: function(e) {
    e.preventDefault();
    this.setSubmitting();
    this.model.save(this.serialize());
  },

  // TODO: get flags to work
  serialize: function() {
    var base = _.object(_.map(this.$el.serializeArray(), _.values));

    var tags = this.tags.collection.filter(function(model){
      return model.get('selected') == true;
    });

    var tagNames = _.compact(_.map(tags, function(tag){
      console.log(tag);
      if (! tag.get ) return;
      return tag.get('tag');
    }));

    console.log(tagNames);
    base.tags = tagNames;
    return base;
  },

  message: function(data) {
    var message = new Message(data);
    this.messages.push(message);
    this.$el.prepend(message.el);

    return message;
  },

  resetMessages: function() {
    _.each(this.messages, function(message){
      message.destroy();
    });
  },

  setSubmitting: function() {
    this.resetMessages();

    this.message({
      type: 'info',
      message: 'Sending ...'
    });

    this.$el.find('input textarea select button').attr('disabled', true);
    this.$el.find('button[type="submit"]').text('Sending ... ');
  },

  unsetSubmitting: function() {
    this.resetMessages();

    this.$el.find('input textarea select button').attr('disabled', false);
    this.$el.find('button[type="submit"]').text('Send');
  },

  onSuccess: function() {
    this.resetMessages();

    this.message({
      type: 'success',
      message: 'Saved successfully.'
    });

    this.trigger('save:success');
  },

  onError: function(e) {
    this.unsetSubmitting();

    this.message({
      message: error.message
    });

    this.trigger('save:error');
  }

});