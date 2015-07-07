var XMLParser = require('xml2js').parseString;
var Inherits = require('util').inherits;

var BaseType = require('./base-type.js');
var Types = require('./types.js');
var Util = require('./util.js');

var WADL = module.exports = function() {
  WADL.super_.apply(this, arguments);
  this.converters = {};
  this.converters.swagger_2 = function(wadl, callback) {
    var swagger = {swagger: '2.0'};
    callback(null, new Types.swagger_2(swagger));
  }
}

Inherits(WADL, BaseType);

WADL.prototype.formatName = 'kaltura';
WADL.prototype.supportedVersions = ['1.0'];
WADL.prototype.getFormatVersion = function () {
  return '1.0';
}

WADL.prototype.parsers = [function(string, cb) {
  XMLParser(string, function(err, parsed) {
    cb(err, parsed ? parsed.xml : null);
  })
}];

WADL.prototype.checkFormat = function (spec) {
  return true;
}

