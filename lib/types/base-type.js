'use strict';

var FS = require('fs');
var YAML = require('yamljs');
var Util = require('./util.js');

var BaseType = module.exports = function(spec) {
  if (spec) this.spec = spec;
  this.type = "base_type";
  this.converters = {};
}

BaseType.prototype.stringify = function() {
  return JSON.stringify(this.spec, null, 2);
}

BaseType.prototype.checkFormat = undefined;

BaseType.prototype.resolveResources = function(options, callback) {
  var self = this;
  var parseCB = function(err, spec) {
    if (err) return callback(err);

    if (!self.checkFormat(spec))
      return callback(Error('Incorrect format'));

    self.spec = spec;
    callback();
  }
  if (options.url) {
    Util.requestUrl(options.url, parseCB)
  } else if (options.file) {
    Util.readFile(options.file, parseCB);
  } else if (options.spec) {
    self.spec = options.spec;
    callback();
  }
}

BaseType.prototype.convertTo = function(type, callback) {
  var convert = this.converters[type];
  if (!convert) {
    throw new Error("Unable to convert from " + this.type + " to " + type);
  }
  var converted = convert(this, callback);
  return converted;
}
