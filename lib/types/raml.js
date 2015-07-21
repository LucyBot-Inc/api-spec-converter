'use strict';

var _ = require('lodash');
var Inherits = require('util').inherits;

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');

var Raml = module.exports = function() {
  Raml.super_.apply(this, arguments);
  this.type = 'raml';
}

Inherits(Raml, BaseType);

Raml.prototype.formatName = 'raml';
Raml.prototype.supportedVersions = ['0.8'];
Raml.prototype.getFormatVersion = function () {
  return '0.8';
}

Raml.prototype.parsers = [Util.parseYAML];

Raml.prototype.checkFormat = function (spec) {
  return true;
}

Raml.prototype.listSubResources = function () {
  return [];
};

Raml.prototype.resolveSubResource = function (resource) {
};
