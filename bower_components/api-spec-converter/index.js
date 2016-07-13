'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

var Formats = require('./lib/formats.js');
var Util = require('./lib/util.js');

var Converter = module.exports = {};
Converter.Formats = Formats;
Converter.BaseFormat = require('./lib/base_format.js');
Converter.ResourceReaders = Util.resourceReaders;

Converter.getSpec = function (source, format, callback) {
  var spec = new Formats[format]();
  return spec.resolveResources(source)
    .return(spec)
    .asCallback(callback);
}

Converter.getFormatName = function (name, version) {
  var result;
  _.each(Formats, function (format, formatName) {
    format = format.prototype;
    if (format.formatName === name && format.supportedVersions.indexOf(version) !== -1)
      result = formatName;
  });
  return result;
};

Converter.convert = function(options, callback) {
  return Converter.getSpec(options.source, options.from)
    .then(fromSpec => fromSpec.convertTo(options.to))
    .asCallback(callback);
}
