var Path = require('path');
var Async = require('async');
var Url = require('url');
var Inherits = require('util').inherits;
var ConvertToSwagger2 = require('swagger-converter');

var Types = require('./types.js');

var Swagger1 = module.exports = function() {
  Types.base_type.apply(this, arguments);
  this.type = 'swagger_1';
}
Inherits(Swagger1, Types.base_type);

Swagger1.prototype.convertTo = function(type) {
  var convert = Swagger1.converters[type];
  if (!convert) {
    throw new Error("Unable to convert from swagger_1 to " + type);
  }
  var converted = convert(this);
  return converted;
}

var containsHost = function(urlString) {
  var url = Url.parse(urlString);
  return url.protocol && url.hostname;
}

Swagger1.prototype.resolveResources = function(options, callback) {
  var self = this;
  if (options.file) {
    Types.readFile(options.file, function(err, spec) {
      if (err) {
        callback(err);
        return;
      }
      var dir = Path.dirname(options.file);
      self.spec = spec;
      var files = self.spec.apis.map(function(api) {
          var filename = Path.join(dir, api.path);
          if (filename.indexOf('.json') === -1) 
            filename += '.json';
          return filename;
      });
      Async.map(files, Types.readFile, function (err, apis) {
        self.apis = apis;
        callback(err);
      });
    });
  } else if (options.url) {
    var url = options.url;
    Types.requestUrl(url, function(err, spec) {
      if (err) {
        callback(err);
        return;
      }
      self.spec = spec;
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
    });
  }
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
  Types.requestUrl(apiUrl, function(err, apiBody) {
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

Swagger1.converters = {};

Swagger1.converters.swagger_2 = function(swagger1) {
  var swagger2 = ConvertToSwagger2(swagger1.spec, swagger1.apis);
  if (swagger2.info.title === 'Title was not specified') {
    swagger2.info.title = swagger2.host;
  }
  return new Types.swagger_2(swagger2);
}
