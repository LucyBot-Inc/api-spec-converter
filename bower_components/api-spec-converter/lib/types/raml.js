'use strict';

var _ = require('lodash');
var RamlParser = require('raml-parser');
var Raml2Swagger = require('raml-to-swagger');
var Inherits = require('util').inherits;

var BaseType = require('../base-type.js');
var Util = require('../util.js');

var Raml = module.exports = function() {
  Raml.super_.apply(this, arguments);
  this.type = 'raml';

  this.converters.swagger_2 = function(raml, callback) {
    try {
      var swagger2 = Raml2Swagger.convert(raml.spec);
    } catch(e) {
      return callback(e);
    }
    return callback(null, swagger2);
  }
}

Inherits(Raml, BaseType);

Raml.prototype.formatName = 'raml';
Raml.prototype.supportedVersions = ['0.8'];
Raml.prototype.getFormatVersion = function () {
  return '0.8';
}

Raml.prototype.readSpec = function (source, callback) {
  var sourceType = Util.getSourceType(source);
  var ramlPromise;

  if (sourceType === 'url' || sourceType === 'file')
    ramlPromise = RamlParser.loadFile(source)
  else
    ramlPromise = RamlParser.load(source)

  ramlPromise.then(
    function (spec) {
      callback(null, spec, sourceType);
    },
    function (error) {
      callback(error);
    }
  );
};

Raml.prototype.checkFormat = function (spec) {
  return true;
}
