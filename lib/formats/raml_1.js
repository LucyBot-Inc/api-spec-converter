'use strict';

var _ = require('lodash');
var RamlParser = require('raml-1-parser');
var Inherits = require('util').inherits;
var Promise = require('bluebird');
var RamlConverter = require('oas-raml-converter');
var YAML = require('js-yaml');
var Util = require('../util.js');

var raml2swagger = new RamlConverter.Converter(RamlConverter.Formats.RAML, RamlConverter.Formats.OAS20);

var BaseFormat = require('../base_format.js');
var Util = require('../util.js');

var Raml = module.exports = function() {
  Raml.super_.apply(this, arguments);
  this.format = 'raml_1';

  this.converters.swagger_2 =
    Promise.method(raml => {
      let prom = null;
      if (raml.sourceType === 'url' || raml.sourceType === 'file') {
        prom = raml2swagger.convertFile(raml.source);
      } else {
        prom = raml2swagger.convertData(raml.source);
      }
      return prom.then(json => JSON.parse(json))
    });

  this.converters.openapi_3 =
    Promise.method(raml => this.convertTransitive(['swagger_2', 'openapi_3']));
}

Inherits(Raml, BaseFormat);

Raml.prototype.readSpec = function (source) {
  var sourceType = Util.getSourceType(source);
  this.source = source;
  this.sourceType = sourceType;

  return Promise.try(() => {
    if (sourceType === 'url' || sourceType === 'file')
      return RamlParser.loadApi(source).then(api => api.toJSON());
    else
      return RamlParser.parseRAML(source).then(api => api.toJSON());
  })
    .then(spec => [spec, sourceType]);
}


Raml.prototype.formatName = 'raml_1';
Raml.prototype.supportedVersions = ['1.0'];
Raml.prototype.getFormatVersion = function () {
  return '1.0';
}

Raml.prototype.stringify = function(options) {
  // Copied from https://github.com/mulesoft/oas-raml-converter/blob/master/src/raml/ramlConverter.js#L299
  return '#%RAML 1.0\n' + unescapeYamlIncludes(YAML.dump(JSON.parse(JSON.stringify(this.spec)), {lineWidth: -1}));
}
function unescapeYamlIncludes(yaml) {
    const start = yaml.indexOf("'!include ");
    if (start === -1) return yaml;
    const end = yaml.indexOf("'", start + 1);
    if (end === -1) return yaml;
    return yaml.substring(0, start) + yaml.substring(start + 1, end) + unescapeYamlIncludes(yaml.substring(end + 1));
}

Raml.prototype.checkFormat = function (spec) {
  return true;
}
