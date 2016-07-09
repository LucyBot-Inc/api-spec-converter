'use strict';

var _ = require('lodash');
var Path = require('path');

var Promise = require('bluebird');
var Inherits = require('util').inherits;
var URI = require('urijs');
var SwaggerConverter = require('swagger-converter');

var BaseFormat = require('../base_format.js');
var Util = require('../util.js');

var Swagger1 = module.exports = function() {
  Swagger1.super_.apply(this, arguments);
  this.format = 'swagger_1';

  this.converters.swagger_2 = Promise.method(swagger1 => {
    var swagger2 = SwaggerConverter.convert(
      swagger1.spec,
      swagger1.subResources,
      {buildTagsFromPaths: true}
    );

    if (swagger2.info.title === 'Title was not specified')
      swagger2.info.title = swagger2.host;
    return swagger2;
  });
}

Inherits(Swagger1, BaseFormat);

Swagger1.prototype.formatName = 'swagger';
Swagger1.prototype.supportedVersions = ['1.0', '1.1', '1.2'];
Swagger1.prototype.getFormatVersion = function () {
  return this.spec.swaggerVersion;
}

Swagger1.prototype.parsers = {
  'JSON': Util.parseJSON
};

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
