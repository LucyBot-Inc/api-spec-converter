'use strict';

var Inherits = require('util').inherits;

var BaseType = require('../base-type.js');
var Util = require('../util.js');
var Google2Swagger = require('google-discovery-to-swagger');

var Google = module.exports = function() {
  Google.super_.apply(this, arguments);
  this.type = 'google';

  this.converters.swagger_2 = function(google, callback) {
    try {
      var swagger2 = Google2Swagger.convert(google.spec);
    } catch(e) {
      return callback(e);
    }
    return callback(null, swagger2);
  }
}

Inherits(Google, BaseType);

Google.prototype.formatName = 'google';
Google.prototype.supportedVersions = ['v1'];
Google.prototype.getFormatVersion = function () {
  return Google2Swagger.getVersion(this.spec);
}

Google.prototype.parsers = [Util.parseJSON];

Google.prototype.checkFormat = function (spec) {
  return Google2Swagger.checkFormat(spec);
}

