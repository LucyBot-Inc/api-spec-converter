'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var SortObject = require('deep-sort-object');
var CompositeError = require('composite-error');

var Types = require('./types.js');
var Util = require('./util.js');

var BaseType = module.exports = function(spec) {
  if (spec) this.spec = spec;
  this.type = "base_type";
  this.converters = {};
}

BaseType.prototype.stringify = function() {
  var json = SortObject(this.spec, function (a, b) {
    //By default sort is done using local aware compare
    //Instead using order that will never change
    if (a === b)
      return 0;
    return (a < b) ? -1 : 1;
  });
  return JSON.stringify(json, null, 2);
}

BaseType.prototype.parsers = [];
BaseType.prototype.checkFormat = undefined;
BaseType.prototype.fixSpec = function () {};
BaseType.prototype.fillMissing = undefined;
BaseType.prototype.validate = function (callback) {
  return Promise.resolve({errors: null, warnings: null})
    .asCallback(callback);
};

BaseType.prototype.listSubResources = function () {
  return [];
};

BaseType.prototype.resolveSubResources = function () {
  var sources = this.listSubResources();

  return Promise.map(_.values(sources), url => this.readSpec(url),
    {concurrency: 5}) //Limit number of parallel downloads to 5
    .then(resources => {
      resources = _.map(resources, x => x[0]);
      var refs = _.keys(sources);
      this.subResources = _.zipObject(refs, resources);
    });
};

BaseType.prototype.parse = function (data) {
  if (!_.isString(data))
    return Promise.resolve(data);

  return Promise.any(_.map(this.parsers, parser => parser(data)))
    .catch(Promise.AggregateError, err => {
      throw new CompositeError('Failed to parse spec', _.toArray(err));
    });
}

BaseType.prototype.readSpec = function (source) {
  var sourceType = Util.getSourceType(source);

  if (!sourceType)
    throw Error('Spec source should be object, string, URL or filename.');

  return Util.resourceReaders[sourceType](source)
    .then(data => this.parse(data))
    .then(spec => [spec, sourceType]);
}

BaseType.prototype.resolveResources = function(source) {
  return this.readSpec(source)
    .spread((spec, sourceType) => {
      if (!this.checkFormat(spec))
        throw Error('Incorrect format');

      this.spec = spec;
      this.sourceType = sourceType;
      //Only URL and File name provide usefull information
      if (sourceType === 'url' || sourceType === 'file')
        this.source = source;
    })
    .then(() => this.resolveSubResources())
    .then(() => {
      this.fixSpec();

      var version = this.getFormatVersion();
      if (this.supportedVersions.indexOf(version) === -1)
        throw Error('Unsupported version');
    });
}

BaseType.prototype.convertTo = function(type, callback) {
  return Promise.try(() => {
    if (type === this.type)
      return Promise.resolve(this);

    var convert = this.converters[type];
    if (!convert)
      throw Error(`Unable to convert from ${this.type} to ${type}`);

    return convert(this)
    .then(spec => {
      spec = new Types[type](spec);
      spec.fixSpec();
      return spec;
    }, err => {
      err.message = 'Error during convertion: ' + err.message;
      throw err;
    });
  }).asCallback(callback);
}
