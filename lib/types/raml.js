'use strict';

var _ = require('lodash');
var ramlParser = require('raml-parser');
var Inherits = require('util').inherits;

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');

var Raml = module.exports = function() {
  Raml.super_.apply(this, arguments);
  this.type = 'raml';
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
    ramlPromise = ramlParser.loadFile(source)
  else
    ramlPromise = ramlParser.load(source)

  ramlPromise .then(
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
