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

// An array containing the swagger top level attributes we want to enforce order on.
// The attributes are listed in reverse order (swagger will be output first).
// The sort function will order according to the index of the attributes in this array.
// Attributes not found will have index -1 and will be sorted alphabetically
// after the elements in this array.
let attr = [
  'externalDocs',
  'tags',
  'security',
  'securityDefinitions',
  'responses',
  'parameters',
  'definitions',
  'paths',
  'produces',
  'consumes',
  'schemes',
  'basePath',
  'host',
  'info',
  'swagger',
];

BaseFormat.prototype.stringify = function(options) {
  var syntax
  var order

  if (typeof options === "object") {
     syntax = options.syntax
     order  = options.order
  }
  // set options to default values if not specified
  syntax = syntax || 'json';     // other value 'yaml'
  order  = order  || 'openapi';  // other value 'alpha' for a-z alphabetical order

  var sortedSpecs = SortObject(this.spec, function (a, b) {
    var aIdx = -1
    var bIdx = -1

    if(order != 'alpha'){
      // do index lookup only if it will be used; i.e. for OpenApi ordering
      aIdx = attr.indexOf(a)
      bIdx = attr.indexOf(b)
    }

    // if none of the args to compare are in the pre-sorted list
    // use the normal alphabetical sort
    if (aIdx == -1 && bIdx == -1) {
        //By default sort is done using local aware compare
        //Instead using order that will never change
        if (a === b)
          return 0;
        return (a < b) ? -1 : 1;
    }

    // sort according to index in attr pre-sorted list
    if (aIdx === bIdx) return 0;
    return aIdx < bIdx ? 1 : -1;
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
