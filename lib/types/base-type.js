'use strict';

var _ = require('lodash');
var Async = require('async');

var Util = require('./util.js');

var BaseType = module.exports = function(spec) {
  if (spec) this.spec = spec;
  this.type = "base_type";
  this.converters = {};
}

BaseType.prototype.stringify = function() {
  return JSON.stringify(this.spec, null, 2);
}

BaseType.prototype.parsers = [];
BaseType.prototype.checkFormat = undefined;

BaseType.prototype.parse = function (data, callback) {
  var self = this;
  if (!_.isString(data))
    callback(null, data);

  var result;
  var errMsg = 'Fail to parse spec:\n';
  Async.detect(self.parsers, function (parser, asyncCb) {
    parser(data, function (err, spec) {
      if (err)
        errMsg += '\t' + err;
      else
        result = spec;
      asyncCb(!err);
    });
  }, function (isParsed) {
    if (isParsed)
      callback(null, result);
    else
      callback(Error(errMsg));
  });
}

BaseType.prototype.readSpec = function (options, callback) {
  var self = this;
  Util.readSpec(options, function(err, data) {
    if (err) return callback(err);

    self.parse(data, function (err, spec) {
      if (err) return callback(err);

      callback(null, spec);
    });
  });
}

BaseType.prototype.resolveResources = function(options, callback) {
  var self = this;
  self.readSpec(options, function(err, spec) {
    if (err) return callback(err);

    if (!self.checkFormat(spec))
      return callback(Error('Incorrect format'));

    self.spec = spec;
    callback();
  });
}

BaseType.prototype.convertTo = function(type, callback) {
  var convert = this.converters[type];
  if (!convert) {
    throw new Error("Unable to convert from " + this.type + " to " + type);
  }
  var converted = convert(this, callback);
  return converted;
}
