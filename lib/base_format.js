'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var SortObject = require('deep-sort-object');
var CompositeError = require('composite-error');

var Formats = require('./formats.js');
var Util = require('./util.js');
var Yaml = require('js-yaml');

var BaseFormat = module.exports = function(spec) {
  if (spec) this.spec = spec;
  this.format = "base_format";
  this.converters = {};
}

// A map type structure mapping key strings, to an index.
// Here the keys are the swagger top level attributes we want to enforce order on.
// The sort function will order according to this index
// Index must start with an int > 0, and monotonically increase
var attr = {}
attr.swagger = 1
attr.info = 2
attr.host = 3
attr.basePath = 4
attr.schemes = 5
attr.consumes = 6
attr.produces = 7
attr.paths = 8
attr.definitions = 9
attr.parameters = 10
attr.responses =11
attr.securityDefinitions = 12
attr.security = 13
attr.tags = 14
attr.externalDocs = 15

// a number larger than the largest idx in attr
var noAttrIdx = 100

BaseFormat.prototype.stringify = function(options) {
  var syntax
  var order

  if (typeof options === "object") {
     syntax = options.syntax
     order  = options.order
  }
  // set options to default values if not specified
  syntax = syntax || 'json'; // other value 'yaml'
  order  = order  || 'az';   // other value 'oa' for OpenApi

  var sortedSpecs = SortObject(this.spec, function (a, b) {
    var aIdx
    var bIdx

    if(order === 'oa'){
      // do index lookup only if it will be used; i.e. for OpenApi ordering
      aIdx = attr[a]
      bIdx = attr[b]
    }

    // if none of the args to compare are in the pre-sorted list
    // use the normal alphabetical sort
    if (!(aIdx || bIdx)) {
        //By default sort is done using local aware compare
        //Instead using order that will never change
        if (a === b)
          return 0;
        return (a < b) ? -1 : 1;
    }

    // sort according to index in attr pre-sorted list
    // order any unknown string to be sorted after any string in attr
    aIdx = aIdx || noAttrIdx
    bIdx = bIdx || noAttrIdx

    if (aIdx === bIdx) {
        return 0;
    }
    return (aIdx < bIdx) ? -1 : 1;
  });

  if (syntax == "yaml") {
    return Yaml.safeDump(sortedSpecs)
  } else {
    return JSON.stringify(sortedSpecs, null, 2);
  }
}

BaseFormat.prototype.parsers = [];
BaseFormat.prototype.checkFormat = undefined;
BaseFormat.prototype.fixSpec = function () {};
BaseFormat.prototype.fillMissing = undefined;
BaseFormat.prototype.validate = function (callback) {
  return Promise.resolve({errors: null, warnings: null})
    .asCallback(callback);
};

BaseFormat.prototype.listSubResources = function () {
  return [];
};

BaseFormat.prototype.resolveSubResources = function () {
  var sources = this.listSubResources();

  return Promise.map(_.values(sources), url => this.readSpec(url),
    {concurrency: 5}) //Limit number of parallel downloads to 5
    .then(resources => {
      resources = _.map(resources, x => x[0]);
      var refs = _.keys(sources);
      this.subResources = _.zipObject(refs, resources);
    });
};

BaseFormat.prototype.parse = function (data) {
  if (!_.isString(data))
    return Promise.resolve(data);

  return Promise.any(_.map(this.parsers, parser => parser(data)))
    .catch(Promise.AggregateError, err => {
      throw new CompositeError('Failed to parse spec', _.toArray(err));
    });
}

BaseFormat.prototype.readSpec = function (source) {
  var sourceType = Util.getSourceType(source);

  if (!sourceType)
    throw Error('Spec source should be object, string, URL or filename.');

  return Util.resourceReaders[sourceType](source)
    .then(data => this.parse(data))
    .then(spec => [spec, sourceType]);
}

BaseFormat.prototype.resolveResources = function(source) {
  return this.readSpec(source)
    .spread((spec, sourceType) => {
      if (!this.checkFormat(spec))
        throw Error('Incorrect format');

      this.spec = spec;
      this.sourceType = sourceType;
      //Only URL and File name provide useful information
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

BaseFormat.prototype.convertTo = function(format, callback) {
  return Promise.try(() => {
    if (format === this.format)
      return Promise.resolve(this);

    var convert = this.converters[format];
    if (!convert)
      throw Error(`Unable to convert from ${this.format} to ${format}`);

    return convert(this)
    .then(spec => {
      spec = new Formats[format](spec);
      spec.fixSpec();
      return spec;
    }, err => {
      err.message = 'Error during conversion: ' + err.message;
      throw err;
    });
  }).asCallback(callback);
}
