'use strict';

var _ = require('lodash');
var Inherits = require('util').inherits;

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');

var Swagger2 = module.exports = function() {
  Swagger2.super_.apply(this, arguments);
  this.type = 'swagger_2';
}

Inherits(Swagger2, BaseType);

Swagger2.prototype.formatName = 'swagger';
Swagger2.prototype.supportedVersions = ['2.0'];
Swagger2.prototype.getFormatVersion = function () {
  return this.spec.swagger;
}

Swagger2.prototype.parsers = [Util.parseJSON, Util.parseYAML];

Swagger2.prototype.checkFormat = function (spec) {
  return !_.isUndefined(spec.swagger);
}

