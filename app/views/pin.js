var Backbone = require('backbone'),
    $ = require('jquery'),
    moment = require('moment'),
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
    'submit': 'onSubmit',
    'click #use-suggested-tags': 'fillSuggested'
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

      self.tags.collection.on('tags:suggested', function(tags){
        if (tags.length > 0) self.$el.find('#use-suggested-tags').removeClass('hidden');
      });
    });
  },

  bindMethods: function() {
    _.bindAll(this)
  },

  listen: function() {
    this.model.on('save:error', this.onError);
    this.model.on('save:success', this.onSuccess);
    this.model.on('change', this.renderChange);
  },

  render: function() {
    this.el.innerHTML = PinTemplate(this.model.toJSON());
    $('body').html(this.el);
  },

  renderChange: function() {
    var self = this;

    var keys = _.intersection(_.keys(this.model.changed), _.keys(this.model.defaults));
    var data = _.pick(this.model.changed, keys);

    _.each(keys, function(key){
      var $el = self.$el.find('[name="'+ key +'"]');

      if ($el.is('input[type="text"]')) {
        $el.val(data[key]);

      } else if ($el.is('input[type="checkbox"]')) {
        $el.prop('checked', data[key]);

      } else if ($el.is('select')) {
        _.each(data[key], function(item){
          var tag = self.tags.collection.findWhere({ tag: item });
          if (tag) tag.set('selected', true);
        });
      }

      // Special cases
      if (key == 'existing') {
        self.$el.find('button[type="submit"]').text(data.existing ? 'Update' : 'Save');
      }

      if (key == 'time') {
        self.$el.find('#time').text('Created ' + moment(data.time).fromNow());
      }
    });
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

  fillSuggested: function(e) {
    e.preventDefault();

    if (this.tags.collection.suggested.length > 0) {
      this.$el.find('#use-suggested-tags').text('Do not use suggested');
      this.tags.collection.add(this.tags.collection.suggested);
      this.tags.collection.suggested = [];

    } else {
      this.$el.find('#use-suggested-tags').text('Use suggested');

      var suggested = this.tags.collection.filter(function(tag){
        return tag.get('suggested');
      });

      this.tags.collection.suggested = suggested;
      this.tags.collection.remove(suggested);
    }

    this.tags.refreshChosen();
  },

  serialize: function() {
    var base = _.object(_.map(this.$el.serializeArray(), _.values));
    base.toread = this.$el.find('[name="toread"]').prop('checked') == true ? 'yes' : 'no';
    base.shared = this.$el.find('[name="shared"]').prop('checked') == true ? 'yes' : 'no';
    base.tags = this.tags.serialize();
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

    this.$el.find('button[type="submit"]').text('Sending ... ');
  },

  unsetSubmitting: function() {
    this.resetMessages();
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