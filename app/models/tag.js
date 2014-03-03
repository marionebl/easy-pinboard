var BaseModel = require('./base.js');

module.exports = BaseModel.extend({
  name: 'tag',

  defaults: {
    tag: null,
    count: 0,
    suggested: false
  }
});