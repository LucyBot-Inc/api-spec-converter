'use strict';

var _ = require('lodash');
var assert = require('assert');
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
    var convertStyle = function(style) {
      switch (style) {
        case 'query':
        case 'header':
          return style;
        case 'template':
          return 'path';
        default:
          assert(false);
      }
    }
    var convertType = function(wadlType) {
      assert(!_.isUndefined(wadlType));
      assert(wadlType.indexOf('xsd:') === 0);
      var restriction = {
        string: {type: "string"},
        double: {type: "number"},
        long: {type: "integer", minimum: -2147483648, maximum: 2147483647},
        positiveInteger: {type: "integer", minimum: 1}
      } [wadlType.substring(4)];
      assert(!_.isUndefined(restriction));
      return restriction;
    }

    var convertDoc = function (doc) {
      assert(_.isArray(doc));
      return _.map(doc, function(subDoc) {
        assert(_.isPlainObject(subDoc));
        return subDoc._.trim();
      }).join('\n\n').trim();
    }

    var convertDefault = function (wadlDefault, type) {
      if (type === 'string')
        return wadlDefault;
      return JSON.parse(wadlDefault);
    }

    var convertParameter = function(wadlParam) {
      var ret = {
        name: wadlParam.$.name,
        required: JSON.parse(wadlParam.$.required),
        in: convertStyle(wadlParam.$.style),
      };
      _.extend(ret, convertType(wadlParam.$.type || 'xsd:string'));

      var wadlDefault = wadlParam.$.default;
      if (!_.isUndefined(wadlDefault))
        ret.default = convertDefault(wadlDefault, ret.type);

      if (wadlParam.doc) {
        ret.description = convertDoc(wadlParam.doc);
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
          route.description = convertDoc(method.doc);
        }
        route.responses = {'200': {description: 'Successful Response'}}
      })
    });
    callback(null, new Types.swagger_2(swagger));
  }
}

Inherits(WADL, BaseType);

WADL.prototype.formatName = 'wadl';
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

