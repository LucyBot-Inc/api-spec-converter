'use strict';

var Types = require('./lib/types/types.js');

var Converter = module.exports = {};

Converter.getSpec = function (source, format, callback) {
  var spec = new Types[format]();
  spec.resolveResources(source, function(error) {
    if (error)
      callback(error, null);
    else
      callback(null, spec);
  });
}

Converter.convert = function(options, callback) {
  //TODO: remove hack.
  var source = options.url || options.file || options.spec;
  Converter.getSpec(source, options.from, function(error, fromSpec) {
    if (error) {
      callback(error, null);
      return;
    }
    fromSpec.convertTo(options.to, callback);
  });
}
