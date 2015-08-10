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
      if (_.isUndefined(doc))
        return {};

      doc = unwrapArray(doc);
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

      var doc = convertDoc(wadlParam.doc);
      //FIXME:
      delete doc.externalDocs;
      _.extend(ret,doc);

      if (wadlParam.option) {
        ret.enum = wadlParam.option.map(function(opt) {
          return opt.$.value;
        })
      }
      return ret;
    }

    function unwrapArray(array) {
      if (_.isUndefined(array))
        return;

      assert(_.isArray(array));
      assert(_.size(array) === 1);
      return array[0];
    }

    function convertMethod(wadlMethod) {
      var method = {
        responses: {
          200: {
            description: 'Successful Response'
          }
        }
      };

      var wadlRequest = unwrapArray(wadlMethod.request);
      if (wadlRequest)
        method.parameters = _.map(wadlRequest.param, convertParameter);

      _.extend(method, convertDoc(wadlMethod.doc));

      return method;
    }

    function converResource(waldResource) {
      var resource = {};

      //Not supported
      assert(!_.has(waldResource, 'resource_type'));
      assert(!_.has(waldResource, 'resource_type'));
      assert(!_.has(waldResource, 'resource'));

      resource.parameters = _.map(waldResource.param, convertParameter);

      _.each(waldResource.method, function(wadlMethod) {
        var httpMethod = wadlMethod.$.name.toLowerCase();
        resource[httpMethod] = convertMethod(wadlMethod);
      });

      return resource;
    }

    var root = unwrapArray(wadl.spec.application.resources);

    var baseUrl = URI(root.$.base);
    var swagger = {
      swagger: '2.0',
      host:  baseUrl.host(),
      basePath: baseUrl.pathname(),
      schemes: [baseUrl.protocol()],
      paths: {}
    };

    _.each(root.resource, function(waldResource) {
      var path = Path.join('/', waldResource.$.path);
      var resource = converResource(waldResource);

      var existingResource = swagger.paths[path];
      if (!_.isUndefined(existingResource)) {
        assert(_.isEqual(existingResource.parameters, resource.parameters));
        _.extend(existingResource, resource);
      }
      else
        swagger.paths[path] = resource;
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

