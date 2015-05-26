'use strict';

var Inherits = require('util').inherits;
var Path = require('path');
var URL = require('url');
var _ = require('lodash');

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');

var IODocs = module.exports = function() {
  IODocs.super_.apply(this, arguments);
  this.type = 'io_docs';
  this.converters = {
    swagger_2: function(iodocs, callback) {
      iodocs = iodocs.spec;
      var swagger = {swagger: '2.0'};
      swagger.info = {
        description: iodocs.description,
        title: iodocs.name
      };
      var baseURL = URL.parse(iodocs.basePath);
      swagger.schemes = [baseURL.protocol];
      swagger.host = [baseURL.hostname];
      swagger.basePath = Path.join(baseURL.path || '', iodocs.publicPath || '');
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
      callback(null, new Types.swagger_2(swagger));
    }
  }
}

Inherits(IODocs, BaseType);

IODocs.prototype.parsers = [Util.parseJSON];

IODocs.prototype.checkFormat = function (spec) {
  return spec.protocol === 'rest';
}
