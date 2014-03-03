var BaseModel = require('./base.js');

module.exports = BaseModel.extend({

  defaults: {
    type: 'alert',
    message: ''
  }

});