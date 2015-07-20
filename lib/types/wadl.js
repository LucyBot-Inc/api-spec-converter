var XMLParser = require('xml2js').parseString;
var Inherits = require('util').inherits;
var Path = require('path');
var URL = require('url');

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');

var WADL = module.exports = function() {
  WADL.super_.apply(this, arguments);
  this.converters = {};
  this.converters.swagger_2 = function(wadl, callback) {
    console.log('wadl', wadl.spec);
    var convertStyle = function(style) {
      if (style === 'query') return 'query';
      if (style === 'template') return 'path';
      return '';
    }
    var convertType = function(wadlType) {
      return wadlType.substring(4);
    }
    var convertParameter = function(wadlParam) {
      console.log('param', wadlParam);
      var ret = {
        name: wadlParam.$.name,
        default: wadlParam.$.default,
        required: JSON.parse(wadlParam.$.required),
        type: convertType(wadlParam.$.type || 'xsd:string'),
        in: convertStyle(wadlParam.$.style),
      }
      if (wadlParam.doc) {
        ret.description = wadlParam.doc.join('\n\n');
      }
      if (wadlParam.option) {
        ret.enum = wadlParam.option.map(function(opt) {
          return opt.$.value;
        })
      }
      return ret;
    }

    var swagger = {swagger: '2.0'};
    var app = wadl.spec.application;
    var firstResources = app.resources[0];
    var baseUrl = URL.parse(firstResources.$.base);
    swagger.host = baseUrl.host;
    swagger.info = {title: baseUrl.host};
    swagger.basePath = baseUrl.pathname;
    swagger.schemes = [baseUrl.protocol.substring(0, baseUrl.protocol.length - 1)];
    swagger.paths = {};
    firstResources.resource.forEach(function(resource) {
      var pathName = Path.join('/', resource.$.path);
      var swaggerPath = swagger.paths[pathName] = {};
      swaggerPath.parameters = (resource.param || []).map(convertParameter);
      (resource.method || []).forEach(function(method) {
        var route = swaggerPath[method.$.name.toLowerCase()] = {};
        if (method.request) {
          route.parameters = (method.request[0].param || []).map(convertParameter);
        } else {
          route.parameters = [];
        }
        if (method.doc) {
          route.description = method.doc.map(function(doc) {return doc._}).join('\n\n').trim();
        }
        route.responses = {'200': {description: 'Successful Response'}}
        console.log('meth', method);
      })
    });
    console.log('swagger', swagger);
    callback(null, new Types.swagger_2(swagger));
  }
}

Inherits(WADL, BaseType);

WADL.prototype.formatName = 'kaltura';
WADL.prototype.supportedVersions = ['1.0'];
WADL.prototype.getFormatVersion = function () {
  return '1.0';
}

WADL.prototype.parsers = [function(string, cb) {
  XMLParser(string, cb);
}];

WADL.prototype.checkFormat = function (spec) {
  return true;
}

