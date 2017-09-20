'use strict';

var _ = require('lodash');
var Inherits = require('util').inherits;
var URI = require('urijs');
var sway = require('sway');
var Promise = require('bluebird');
var swagger2openapi = require('swagger2openapi');

var BaseFormat = require('../base_format.js');
var Util = require('../util.js');

var Swagger2 = module.exports = function() {
  Swagger2.super_.apply(this, arguments);
  this.format = 'swagger_2';
  this.converters.openapi_3 = Promise.method(swagger => swagger2openapi.convert(swagger.spec,{direct:true,patch:true}));
}

Inherits(Swagger2, BaseFormat);

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
    //TODO: decide what to do with base path
  }

  Util.removeNonValues(swagger);

  var basePath = swagger.basePath
  if (_.isString(basePath))
    swagger.basePath = URI().path(basePath).normalize().path();

  _.each(swagger.definitions, function (schema) {
    if (!_.isUndefined(schema.id))
      delete schema.id;
  });
};

Swagger2.prototype.fillMissing = function (dummyData) {
  dummyData = dummyData || {
    info: {
      title: '< An API title here >',
      version: '< An API version here >'
    }
  };

  this.spec = _.merge(dummyData, this.spec);
}

Swagger2.prototype.parsers = {
  'JSON': Util.parseJSON,
  'YAML': Util.parseYAML
};

Swagger2.prototype.checkFormat = function (spec) {
  return !_.isUndefined(spec.swagger);
}

Swagger2.prototype.validate = function (callback) {
  var promise = sway.create({definition: this.spec, jsonRefs: this.jsonRefs})
    .then(function (swaggerObj) {
      var result = swaggerObj.validate();

      result.remotesResolved = swaggerObj.definitionRemotesResolved;

      if (_.isEmpty(result.errors))
        result.errors = null;
      if (_.isEmpty(result.warnings))
        result.warnings = null;
      return result;
    });
  return Promise.resolve(promise).asCallback(callback);
};
