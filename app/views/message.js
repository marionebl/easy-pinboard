var Backbone = require('backbone'),
    $ = require('jquery'),
    MessageModel = require('../models/message.js'),
    MessageTemplate = require('../templates/message.hbs');

module.exports = Backbone.View.extend({
  initialize: function(data){
    this.model = new MessageModel(data);
    this.render();
  },

  render: function() {
    this.el.className = 'message ' + this.model.get('type');
    this.el.innerHTML = MessageTemplate(this.model.toJSON());
  },

  destroy: function() {
    this.$el.remove();
  }

});