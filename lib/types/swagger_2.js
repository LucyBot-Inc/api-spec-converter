'use strict';

var Inherits = require('util').inherits;

var BaseType = require('./base-type.js');
var Types = require('./types.js');

var Swagger2 = module.exports = function() {
  Swagger2.super_.apply(this, arguments);
  this.type = 'swagger_2';
}

Inherits(Swagger2, BaseType);

Swagger2.prototype.checkFormat = function (spec) {
  return spec.swagger === '2.0';
}

