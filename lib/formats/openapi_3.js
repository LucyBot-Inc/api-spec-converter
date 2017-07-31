'use strict';

var Inherits = require('util').inherits;

var Promise = require('bluebird');
var _ = require('lodash');
var BaseFormat = require('../base_format.js');
var Util = require('../util.js');
var validator = require('swagger2openapi/validate.js');

var OpenApi3 = module.exports = function() {
  OpenApi3.super_.apply(this, arguments);
  this.format = 'openapi_3';
};
Inherits(OpenApi3, BaseFormat);

OpenApi3.prototype.formatName = 'openapi';
OpenApi3.prototype.supportedVersions = ['3.0'];
OpenApi3.prototype.getFormatVersion = function () {
  var versionComponents = this.spec.openapi.split('.');
  return versionComponents[0]+'.'+versionComponents[1];
};

OpenApi3.prototype.fillMissing = function (dummyData) {
  dummyData = dummyData || {
    info: {
      title: '< An API title here >',
      version: '< An API version here >'
    }
  };

  this.spec = _.merge(dummyData, this.spec);
};

OpenApi3.prototype.parsers = {
  'JSON': Util.parseJSON,
  'YAML': Util.parseYAML
};

OpenApi3.prototype.checkFormat = function (spec) {
  return !_.isUndefined(spec.openapi);
};

OpenApi3.prototype.validate = function (callback) {
  var openapi = this.spec;
  var promise = new Promise(function(resolve,reject){
    var result = {};
    try {
      result = validator.validateSync(openapi,result,function(err,options){
      });
    }
    catch (ex) {
      result.errors = {message: ex.message, context: result.context};
    }
    resolve(result);
  });
  return Promise.resolve(promise).asCallback(callback);
};

