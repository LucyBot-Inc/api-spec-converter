'use strict';

var _ = require('lodash');
var Inherits = require('util').inherits;
var URI = require('URIjs');

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

Swagger2.prototype.fixSpec = function () {
  var version = this.spec.swagger;
  //Typical mistake is to make version number insted of string
  if (_.isNumber(version))
    this.spec.swagger = version % 1 ? version.toString() : version.toFixed(1);

  if (this.sourceType == 'url') {
    var url = URI(this.source);
    var swagger = this.spec;
    swagger.host = swagger.host || url.host();
    swagger.schemes = swagger.schemes || [url.scheme()];
    //TODO: deside what to do with base path
  }

  var basePath = this.spec.basePath
  if (_.isString(basePath))
    this.spec.basePath = URI().path(basePath).normalize().toString();
};

Swagger2.prototype.parsers = [Util.parseJSON, Util.parseYAML];

Swagger2.prototype.checkFormat = function (spec) {
  return !_.isUndefined(spec.swagger);
}

