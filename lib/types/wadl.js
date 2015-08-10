'use strict';

var _ = require('lodash');
var assert = require('assert');
var XMLParser = require('xml2js').parseString;
var Inherits = require('util').inherits;
var Path = require('path');
var URI = require('URIjs');

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
      var type = wadlType.substring(4);
      switch (type) {
        case 'boolean':
        case 'string':
        case 'integer':
          return {type: type};
        case 'double':
          return {type: "number"};
        case 'int':
          return {type: "integer", minimum: -2147483648, maximum: 2147483647};
        case 'long':
          return {type: "integer", minimum: -9223372036854775808, maximum: 9223372036854775807};
        case 'positiveInteger':
          return {type: "integer", minimum: 1};
        default:
          assert(false, 'Unsupported type: ' + wadlType);
      }
    }

    var convertDoc = function (doc) {
      assert(_.isArray(doc) && _.size(doc) === 1);
      doc = doc[0];
      if (_.isString(doc))
        return {description: doc.trim()};
      if (_.isPlainObject(doc)) {
        var result = {}
        if (doc._)
          result.description = doc._.trim();
        var externalUrl = doc.$['apigee:url'];
        if (externalUrl)
          result.externalDocs = {url: externalUrl};
        return result;
      }
      assert(false);
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
        var doc = convertDoc(wadlParam.doc);
        //FIXME:
        delete doc.externalDocs;
        _.extend(ret,doc);
      }
      if (wadlParam.option) {
        ret.enum = wadlParam.option.map(function(opt) {
          return opt.$.value;
        })
      }
      return ret;
    }

    var root = wadl.spec.application.resources;
    assert(_.size(root) === 1);
    root = root[0];

    var baseUrl = URI(root.$.base);
    var swagger = {
      swagger: '2.0',
      host:  baseUrl.host(),
      basePath: baseUrl.pathname(),
      schemes: [baseUrl.protocol()],
      paths: {}
    };

    _.each(root.resource, function(resource) {
      var pathName = Path.join('/', resource.$.path);
      var swaggerPath = swagger.paths[pathName] = {};
      swaggerPath.parameters = _.map(resource.param, convertParameter);

      _.each(resource.method, function(method) {
        var route = swaggerPath[method.$.name.toLowerCase()] = {};
        if (method.request) {
          route.parameters = _.map(method.request[0].param, convertParameter);
        } else {
          route.parameters = [];
        }
        if (method.doc)
          _.extend(route, convertDoc(method.doc));

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

