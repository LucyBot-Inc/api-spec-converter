'use strict';

var Inherits = require('util').inherits;

var Promise = require('bluebird');
var BaseType = require('../base-type.js');
var Util = require('../util.js');
var Google2Swagger = require('google-discovery-to-swagger');

var Google = module.exports = function() {
  Google.super_.apply(this, arguments);
  this.type = 'google';

  this.converters.swagger_2 =
    Promise.method(google => Google2Swagger.convert(google.spec));
}

Inherits(Google, BaseType);

Google.prototype.formatName = 'google';
Google.prototype.supportedVersions = ['v1'];
Google.prototype.getFormatVersion = function () {
  return Google2Swagger.getVersion(this.spec);
}

Google.prototype.parsers = {
  'JSON': Util.parseJSON
};

Google.prototype.checkFormat = function (spec) {
  return Google2Swagger.checkFormat(spec);
}

