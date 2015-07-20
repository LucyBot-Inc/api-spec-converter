'use strict';

var _ = require('lodash');
var Path = require('path');
var Async = require('async');
var Inherits = require('util').inherits;
var URI = require('URIjs');
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

Swagger1.prototype.formatName = 'swagger';
Swagger1.prototype.supportedVersions = ['1.0', '1.1', '1.2'];
Swagger1.prototype.getFormatVersion = function () {
  return this.spec.swaggerVersion;
}

Swagger1.prototype.parsers = [Util.parseJSON];

Swagger1.prototype.checkFormat = function (spec) {
  return !_.isUndefined(spec.swaggerVersion);
}

Swagger1.prototype.fixSpec = function () {
  if (this.url) {
    var url = URI(this.url);
    var basePath = URI(this.spec.basePath || '');
    basePath.scheme(basePath.scheme() || url.scheme());
    basePath.host(basePath.host() || url.host());
    this.spec.basePath = basePath.href();
  }
};

Swagger1.prototype.resolveSubResources = function(source, sourceType, callback) {
  var sources = [];

  //TODO: unify code
  if (sourceType === 'file') {
    var dir = Path.dirname(source);
    _.each(this.spec.apis, function(api) {
        var filename = Path.join(dir, api.path);
        if (filename.indexOf('.json') === -1) 
          filename += '.json';
        sources.push(filename);
    }, this);
  } else if (sourceType === 'url') {
    var baseUrl = URI(source).query('');

    if (this.spec.basePath) {
      var basePath = URI(this.spec.basePath);
      if (basePath.is('absolute'))
        baseUrl = basePath;
      else
        baseUrl.resource(basePath.href());
    }

    if (baseUrl.suffix() === 'json')
      baseUrl.filename('');

    _.each(this.spec.apis, function(api) {
        // skip embedded documents;
        if (!_.isEmpty(api.operations))
          return;

        var apiUrl = api.path;
        if (URI(apiUrl).is('relative'))
          apiUrl = baseUrl + apiUrl;
        apiUrl = apiUrl.replace('{format}', 'json');
        apiUrl = URI(apiUrl).normalize().href();

        sources.push(apiUrl);
    });
  }

  Async.map(sources, this.readSpec.bind(this), function (err, apis) {
    this.apis = apis;
    callback(err);
  }.bind(this));
}
