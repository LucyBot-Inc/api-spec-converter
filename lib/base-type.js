'use strict';

var _ = require('lodash');
var Async = require('async');

var Types = require('./types.js');
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
BaseType.prototype.fixSpec = function () {};
BaseType.prototype.validate = function (callback) {
  callback(null, null);
};

BaseType.prototype.listSubResources = function () {
  return [];
};
BaseType.prototype.resolveSubResource = undefined;

BaseType.prototype.resolveSubResources = function (callback) {
  var sources = this.listSubResources();
  Async.map(sources,
    function (source, asyncCb) {
      var location = this.resolveSubResource(source);
      this.readSpec(location, asyncCb);
    }.bind(this),
    function (err, resources) {
      if (err)
        return callback(err);

      this.subResources = _.zipObject(sources, resources);
      callback(null);
    }.bind(this)
  );
};

BaseType.prototype.parse = function (data, callback) {
  if (!_.isString(data))
    callback(null, data);

  var result;
  var errMsg = 'Fail to parse spec:\n';
  Async.detect(this.parsers, function (parser, asyncCb) {
    parser(data, function (err, spec) {
      if (err)
        errMsg += '\t' + err.stack;
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

BaseType.prototype.readSpec = function (source, callback) {
  var sourceType = Util.getSourceType(source);

  if (!sourceType)
    callback(Error('Spec source should be object, string, URL or filename.'));

  Util.resourceReaders[sourceType](source, function(err, data) {
    if (err) return callback(err);

    if (_.isPlainObject(data))
      return callback(err, data, sourceType);

    this.parse(data, function (err, spec) {
      if (err) return callback(err);

      callback(err, spec, sourceType);
    }.bind(this));
  }.bind(this));
}

BaseType.prototype.resolveResources = function(source, callback) {
  this.readSpec(source, function(err, spec, sourceType) {
    if (err) return callback(err);

    if (!this.checkFormat(spec))
      return callback(Error('Incorrect format'));

    this.spec = spec;

    this.sourceType = sourceType;
    //Only URL and File name provide usefull information
    if (sourceType === 'url' || sourceType === 'file')
      this.source = source;

    this.resolveSubResources(function (error) {
      if (error) return callback(error);

      this.fixSpec();

      var version = this.getFormatVersion();
      if (this.supportedVersions.indexOf(version) === -1)
        return callback(Error('Unsupported version'));

      callback();
    }.bind(this));
  }.bind(this));
}

BaseType.prototype.convertTo = function(type, callback) {
  if (type === this.type)
    return callback(null, this);

  var convert = this.converters[type];
  if (!convert) {
    throw new Error("Unable to convert from " + this.type + " to " + type);
  }
  convert(this, function (err, spec) {
    if (err) {
      err.message = 'Error during convertion: ' + err.message;
      return callback(err);
    }
    spec = new Types[type](spec);
    spec.fixSpec();
    callback(null, spec);
  });
}
