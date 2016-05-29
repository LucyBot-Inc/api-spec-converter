'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

var Types = require('./lib/types.js');
var Util = require('./lib/util.js');

var Converter = module.exports = {};
Converter.Types = Types;
Converter.BaseType = require('./lib/base-type.js');
Converter.ResourceReaders = Util.resourceReaders;

Converter.getSpec = function (source, type, callback) {
  var spec = new Types[type]();
  return spec.resolveResources(source)
    .return(spec)
    .asCallback(callback);
}

Converter.getTypeName = function (name, version) {
  var result;
  _.each(Types, function (type, typeName) {
    type = type.prototype;
    if (type.formatName === name && type.supportedVersions.indexOf(version) !== -1)
      result = typeName;
  });
  return result;
};

Converter.convert = function(options, callback) {
  return Converter.getSpec(options.source, options.from)
    .then(fromSpec => fromSpec.convertTo(options.to))
    .asCallback(callback);
}
