var $ = require('jquery'),
    BaseModel = require('./base.js'),
    Pinboard = require('../library/pinboard.js');

module.exports = BaseModel.extend({
  name: 'user',

  defaults: {
    user: null,
    password: null,
    apiToken: null
  },

  authorize: function() {
    var pinboard = new Pinboard(this.get('user'));
    var self = this;

    pinboard.login(this.get('password'), function(response, error){
      if (error) {
        self.trigger('authorize:error', error);
      } else {
        self.set('apiToken', response);
        self.trigger('authorize:success', response);
      }
    });
  },

  store: function() {
    this.unset('password');
    localStorage.setItem('user', JSON.stringify(this.toJSON()));
  }

});