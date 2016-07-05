'use strict';

var Inherits = require('util').inherits;
var Path = require('path');
var URL = require('url');
var _ = require('lodash');
var Promise = require('bluebird');

var BaseFormat = require('../base_format.js');
var Util = require('../util.js');

var IODocs = module.exports = function() {
  IODocs.super_.apply(this, arguments);
  this.type = 'io_docs';
  this.converters.swagger_2 =
    Promise.method(iodocs => convertToSwagger(iodocs.spec));
}

Inherits(IODocs, BaseFormat);

IODocs.prototype.formatName = 'ioDocs';
IODocs.prototype.supportedVersions = ['1.0'];
IODocs.prototype.getFormatVersion = function () {
  //It's looks like format doesn't have versions, so treat it as '1.0'
  return '1.0';
}

IODocs.prototype.parsers = {
  'JSON': Util.parseJSON
};

IODocs.prototype.checkFormat = function (spec) {
  return spec.protocol === 'rest';
}

function convertToSwagger(iodocs) {
  var swagger = {swagger: '2.0'};
  swagger.info = {
    description: iodocs.description,
    title: iodocs.name
  };

  var baseURL = URL.parse(iodocs.basePath);
  swagger.schemes = [baseURL.protocol];
  swagger.host = [baseURL.hostname];
  swagger.basePath = Util.joinPath(baseURL.path || '', iodocs.publicPath || '');
  swagger.definitions = iodocs.schemas;
  swagger.paths = {};
  _.forIn(iodocs.resources, function(resource, name) {
    _.forIn(resource.methods, function(method, name) {
      swagger.paths[method.path] = swagger.paths[method.path] || {};
      var route = swagger.paths[method.path][method.httpMethod.toLowerCase()] = {};
      route.responses = {'200': {description: "success"}};
      route.parameters = [];
      _.forIn(method.parameters, function(param, paramName) {
        var swaggerParam = {
          name: paramName,
          in: param.location || 'query',
          default: param.default,
          description: param.description,
          type: param.type,
          enum: param.enum,
        }
        if (swaggerParam.in === 'pathReplace') swaggerParam.in = 'path';
        route.parameters.push(swaggerParam);
      });
    });
  });

  return swagger;
}
