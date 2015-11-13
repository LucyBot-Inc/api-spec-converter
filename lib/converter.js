'use strict';

var _ = require('lodash');

var Converter = module.exports = function(types) {
  Converter.Types = types;
  return Converter;
}
Converter.BaseType = require('./types/base-type.js')

Converter.getSpec = function (source, type, callback) {
  var spec = new Converter.Types[type]();
  spec.resolveResources(source, function(error) {
    if (error)
      callback(error, null);
    else
      callback(null, spec);
  });
}

Converter.getTypeName = function (name, version) {
  var result;
  _.each(Converter.Types, function (type, typeName) {
    type = type.
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
