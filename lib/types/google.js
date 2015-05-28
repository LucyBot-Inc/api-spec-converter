'use strict';

var Inherits = require('util').inherits;

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');
var Google2Swagger = require('google-discovery-to-swagger');

var Google = module.exports = function() {
  Google.super_.apply(this, arguments);
  this.type = 'google';

  this.converters.swagger_2 = function(google, callback) {
    try {
      var swagger2 = Google2Swagger.convert(google.spec);
    } catch(e) {
      callback(Error('Exception during convertion: ' + e));
      return;
    }
    callback(null, new Types.swagger_2(swagger2));
  }
}

Inherits(Google, BaseType);

Google.prototype.parsers = [Util.parseJSON];

Google.prototype.checkFormat = function (spec) {
  return Google2Swagger.checkFormat(spec);
}

