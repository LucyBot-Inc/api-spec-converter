'use strict';

var _ = require('lodash');
var RamlParser = require('raml-parser');
var Raml2Swagger = require('raml-to-swagger');
var Inherits = require('util').inherits;
var Promise = require('bluebird');

var BaseFormat = require('../base_format.js');
var Util = require('../util.js');

var Raml = module.exports = function() {
  Raml.super_.apply(this, arguments);
  this.format = 'raml';

  this.converters.swagger_2 =
    Promise.method(raml => Raml2Swagger.convert(raml.spec));
}

Inherits(Raml, BaseFormat);

Raml.prototype.formatName = 'raml';
Raml.prototype.supportedVersions = ['0.8'];
Raml.prototype.getFormatVersion = function () {
  return '0.8';
}

Raml.prototype.readSpec = function (source) {
  var sourceType = Util.getSourceType(source);

  return Promise.try(() => {
    if (sourceType === 'url' || sourceType === 'file')
      return RamlParser.loadFile(source)
    else
      return RamlParser.load(source)
  })
    .then(spec => [spec, sourceType]);
}

Raml.prototype.checkFormat = function (spec) {
  return true;
}
