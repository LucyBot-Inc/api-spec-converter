'use strict';

var _ = require('lodash');
var Inherits = require('util').inherits;
var URI = require('urijs');
var sway = require('sway');

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
  var swagger = this.spec;

  //Typical mistake is to make version number insted of string
  var version = _.get(swagger, 'info.version');
  if (_.isNumber(version))
    swagger.info.version = version % 1 ? version.toString() : version.toFixed(1);

  if (this.sourceType == 'url') {
    var url = URI(this.source);
    swagger.host = swagger.host || url.host();
    swagger.schemes = swagger.schemes || [url.scheme()];
    //TODO: deside what to do with base path
  }

  Util.removeNonValues(swagger);

  var basePath = swagger.basePath
  if (_.isString(basePath))
    swagger.basePath = URI().path(basePath).normalize().toString();

  _.each(swagger.definitions, function (schema) {
    if (!_.isUndefined(schema.id))
      delete schema.id;
  });
};

Swagger2.prototype.parsers = [Util.parseJSON, Util.parseYAML];

Swagger2.prototype.checkFormat = function (spec) {
  return !_.isUndefined(spec.swagger);
}

Swagger2.prototype.validate = function (callback) {
  sway.create({definition: this.spec})
  .then(function (swaggerObj) {
    var result = swaggerObj.validate();

    var errors = result.errors;
    if (_.isEmpty(errors))
      errors = null;

    var warnings = result.warnings;
    if (_.isEmpty(warnings))
      warnings = null;

    return callback(errors, warnings);
  })
  .catch(function (error) {
    callback(error);
  });
};
