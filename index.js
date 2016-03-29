'use strict';

var Types = require('./lib/types.js');
var Util = require('./lib/util.js');
var _ = require('lodash');

var Converter = module.exports = {};

Converter.Types = Types;
Converter.BaseType = require('./lib/base-type.js');
Converter.ResourceReaders = Util.resourceReaders;

Converter.getSpec = function (source, type, callback) {
  var spec = new Types[type]();
  spec.resolveResources(source, function(error) {
    if (error)
      callback(error, null);
    else
      callback(null, spec);
  });
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
  Converter.getSpec(options.source, options.from, function(error, fromSpec) {
    if (error) {
      callback(error, null);
      return;
    }
    fromSpec.convertTo(options.to, callback);
  });
}
