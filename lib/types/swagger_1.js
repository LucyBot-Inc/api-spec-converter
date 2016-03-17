'use strict';

var _ = require('lodash');
var Path = require('path');
var Async = require('async');
var Inherits = require('util').inherits;
var URI = require('urijs');
var SwaggerConverter = require('swagger-converter');

var BaseType = require('../base-type.js');
var Util = require('../util.js');

var Swagger1 = module.exports = function() {
  Swagger1.super_.apply(this, arguments);
  this.type = 'swagger_1';

  this.converters.swagger_2 = function(swagger1, callback) {
    try {
      var swagger2 = SwaggerConverter.convert(
        swagger1.spec,
        swagger1.subResources,
        {buildTagsFromPaths: true}
      );

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
  return SwaggerConverter.listApiDeclarations(this.source, this.spec);
};
