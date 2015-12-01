'use strict';

var _ = require('lodash');
var Path = require('path');
var Async = require('async');
var Inherits = require('util').inherits;
var URI = require('urijs');
var ConvertToSwagger2 = require('swagger-converter').convert;

var BaseType = require('../base-type.js');
var Util = require('../util.js');

var Swagger1 = module.exports = function() {
  Swagger1.super_.apply(this, arguments);
  this.type = 'swagger_1';

  this.converters.swagger_2 = function(swagger1, callback) {
    try {
      var swagger2 = ConvertToSwagger2(swagger1.spec, swagger1.subResources);

      if (swagger2.info.title === 'Title was not specified')
        swagger2.info.title = swagger2.host;
    } catch(e) {
      return callback(e);
    }
    return callback(null, swagger2);
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
  //TODO: Move all code into 'swagger-converter'
  var baseUrl = URI(this.source || '').query('');

  var basePath = URI(this.spec.basePath || '');
  if (basePath.is('absolute'))
    baseUrl = basePath;
  else
    baseUrl = basePath.absoluteTo(baseUrl);

  if (this.spec.swaggerVersion === '1.0' && baseUrl.suffix() === 'json')
    baseUrl.filename('');

  return _.transform(this.spec.apis, function (result, api) {
     if (_.isUndefined(api.path))
       return;

     // skip embedded documents
     if (!_.isEmpty(api.operations))
       return;

     var resourceUrl = URI(api.path.replace('{format}', 'json'));
     if (resourceUrl.is('relative'))
       resourceUrl = URI(baseUrl.href() + resourceUrl.href());
     result[api.path] = resourceUrl.normalize().href();
  }, {});
};
