'use strict';

var Inherits = require('util').inherits;

var Types = require('./types.js');

var Swagger2 = module.exports = function() {
  Types.base_type.apply(this, arguments);
  this.type = 'swagger_2';
}

Inherits(Swagger2, Types.base_type);

