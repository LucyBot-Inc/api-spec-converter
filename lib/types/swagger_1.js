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
      var swagger2 = ConvertToSwagger2(swagger1.spec, _.values(swagger1.subResources));
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
  if (this.sourceType == 'url') {
    var url = URI(this.source);

    if (!this.spec.basePath)
      this.spec.basePath = url.filename('').href();
    else {
      var basePath = URI(this.spec.basePath);
      basePath.scheme(basePath.scheme() || url.scheme());
      basePath.host(basePath.host() || url.host());
      this.spec.basePath = basePath.href();
    }
  }
};

Swagger1.prototype.listSubResources = function () {
  var resources = []
  _.each(this.spec.apis, function (api) {
     if (_.isUndefined(api.path))
       return;

     // skip embedded documents;
     if (!_.isEmpty(api.operations))
       return;

     var path = api.path;
     path = path.replace('{format}', 'json');
     resources.push(path);
  });
  return resources;
};

Swagger1.prototype.resolveSubResource = function (resource) {
  if (this.sourceType === 'file') {
    var dir = Path.dirname(this.source);
    var filename = Path.join(dir, resource);
    if (filename.indexOf('.json') === -1) 
      filename += '.json';
    return filename;
  } else if (this.sourceType === 'url') {
    var baseUrl = URI(this.source).query('');

    if (this.spec.basePath) {
      var basePath = URI(this.spec.basePath);
      if (basePath.is('absolute'))
        baseUrl = basePath;
      else
        baseUrl.resource(basePath.href());
    }

    if (this.getFormatVersion() === '1.0' && baseUrl.suffix() === 'json')
      baseUrl.filename('');

    var resourceUrl = resource;
    if (URI(resource).is('relative'))
      resourceUrl = baseUrl + resource;
    return URI(resourceUrl).normalize().href();
  }
  //TODO: report error
}
