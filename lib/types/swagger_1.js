'use strict';

var Path = require('path');
var Async = require('async');
var Url = require('url');
var URI = require('URIjs');
var Inherits = require('util').inherits;
var ConvertToSwagger2 = require('swagger-converter');

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');

var Swagger1 = module.exports = function() {
  Swagger1.super_.apply(this, arguments);
  this.type = 'swagger_1';

  this.converters.swagger_2 = function(swagger1, callback) {
    try {
      var swagger2 = ConvertToSwagger2(swagger1.spec, swagger1.apis);
    } catch(e) {
      callback(Error('Exception during convertion: ' + e));
      return;
    }
    if (swagger2.info.title === 'Title was not specified') {
      swagger2.info.title = swagger2.host;
    }
    callback(null, new Types.swagger_2(swagger2));
  }
}

Inherits(Swagger1, BaseType);

var containsHost = function(urlString) {
  var url = Url.parse(urlString);
  return url.protocol && url.hostname;
}

Swagger1.prototype.parsers = [Util.parseJSON];

Swagger1.prototype.checkFormat = function (spec) {
  return ['1.0', '1.1', '1.2'].indexOf(spec.swaggerVersion) !== -1;
}

Swagger1.prototype.resolveResources = function(source, callback) {
  var self = this;
  var resolveCb;

  //TODO: unify code
  var uri = new URI(source);
  if (uri.is('relative')) {
    resolveCb = function (err) {
      if (err) return callback(err);

      var dir = Path.dirname(source);
      var files = self.spec.apis.map(function(api) {
          var filename = Path.join(dir, api.path);
          if (filename.indexOf('.json') === -1) 
            filename += '.json';
          return filename;
      });
      Async.map(files, self.readSpec.bind(self), function (err, apis) {
        self.apis = apis;
        callback(err);
      });
    };
  } else if (uri.is('url')) {
    var url = source;
    resolveCb = function (err) {
      if (err) return callback(err);

      var baseUrl = self.spec.basePath;
      if (!baseUrl || !containsHost(baseUrl)) {
        baseUrl = Url.parse(url);
        if (self.spec.basePath) baseUrl.pathname = self.spec.basePath;
      } else {
        baseUrl = Url.parse(baseUrl);
      }
      if (!baseUrl.query) {
        baseUrl.query = Url.parse(url).query;
      }
      Async.map(self.spec.apis, resolveNestedAPI.bind(self, baseUrl), function (err, apis) {
        self.apis = apis;
        callback(err);
      });
    };
  }
  Swagger1.super_.prototype.resolveResources.call(this, source, resolveCb);
}

var resolveNestedAPI = function(baseUrl, api, callback) {
  api.path = api.path.replace('{format}', 'json');
  if (api.operations) {
    var apiBody = {apis: [api]};
    setAPIDefaults(apiBody, baseUrl)
    return callback(null, apiBody);
  }
  var apiUrl = api.path;
  if (!containsHost(apiUrl)) {
    apiUrl = Url.parse(Url.format(baseUrl).replace('/api-docs.json', ''));
    apiUrl.pathname += api.path;
    apiUrl = Url.format(apiUrl);
  }
  apiUrl = Url.parse(apiUrl);
  if (!apiUrl.query) apiUrl.query = baseUrl.query;
  apiUrl = Url.format(apiUrl);
  this.readSpec(apiUrl, function(err, apiBody) {
    if (err) {
      callback(err);
      return;
    }
    setAPIDefaults(apiBody, baseUrl);
    callback(null, apiBody);
  })
}

var setAPIDefaults = function(apiBody, baseUrl) {
  if (apiBody.basePath && !containsHost(apiBody.basePath)) {
    var fullUrl = Url.parse(Url.format(baseUrl));
    fullUrl.pathname = apiBody.basePath;
    apiBody.basePath = Url.format(fullUrl);
  }
  apiBody.apis = apiBody.apis || [];
  apiBody.models = apiBody.models || {};
  apiBody.apis.forEach(function(api) {
    api.operations = api.operations || [];
    api.operations.forEach(function(op) {
      op.method = op.method || op.httpMethod || 'GET';
      op.parameters = op.parameters || [];
      op.parameters.forEach(function(param) {
        param.type = param.type || param.dataType || 'string';
      })
    })
  })
}

