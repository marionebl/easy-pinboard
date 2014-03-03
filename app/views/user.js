var Backbone = require('backbone'),
    $ = require('jquery'),
    _ = require('lodash'),
    UserModel = require('../models/user.js'),
    UserTemplate = require('../templates/user.hbs'),
    Message = require('../views/message.js');

module.exports = Backbone.View.extend({

  tagName: 'form',

  attributes: {
    name: 'user'
  },

  events: {
    'submit': 'onSubmit'
  },

  messages: [],

  methods: [
    'renderMessage', 'setSubmitting', 'unsetSubmitting',
    'onAuthorizeSuccess', 'onAuthorizeError'
  ],

  initialize: function(){
    this.model = new UserModel();
    this.bindMethods();
    this.listen();
    this.render();
  },

  bindMethods: function() {
    _.bindAll(this)
  },

  listen: function() {
    this.model.on('authorize:error', this.onAuthorizeError);
    this.model.on('authorize:success', this.onAuthorizeSuccess);
  },

  render: function() {
    this.el.innerHTML = UserTemplate(this.model.toJSON());
    $('body').html(this.el);
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

  serialize: function() {
    return _.object(_.map(this.$el.serializeArray(), _.values));
  },

  setSubmitting: function() {
    this.resetMessages();

    this.message({
      type: 'info',
      message: 'Authenticating ...'
    });

    this.$el.find('input textarea select button').attr('disabled', true);
    this.$el.find('button[type="submit"]').text('Sending ... ');
  },

  unsetSubmitting: function() {
    this.resetMessages();

    this.$el.find('input textarea select button').attr('disabled', false);
    this.$el.find('button[type="submit"]').text('Send');
  },

  onAuthorizeError: function(error) {
    this.unsetSubmitting();
    this.message({
      message: error.message
    });
  },

  onAuthorizeSuccess: function() {
    this.resetMessages();
    this.model.store();

    this.message({
      type: 'success',
      message: 'Logged you in successfully.'
    });

    this.trigger('auth:success');
  },

  onSubmit: function(e) {
    e.preventDefault();
    this.setSubmitting();
    this.model.set(this.serialize());
    this.model.authorize();
  },

  destroy: function() {
    this.$el.remove();
  }
});