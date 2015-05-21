'use strict';

var FS = require('fs');
var Request = require('request');
var Protagonist = require('protagonist');

var Types = module.exports = {};

Types.base_type = require('./base-type.js');
Types.swagger_1 = require('./swagger_1.js');
Types.swagger_2 = require('./swagger_2.js');
Types.api_blueprint = require('./api_blueprint.js');

Types.getType = function(spec) {
  if (spec.ast) return 'api_blueprint';
  var swagger = spec.swagger || spec.swaggerVersion;
  if (!swagger) {
    throw new Error("Unsupported spec type");
  }
  if (typeof swagger !== 'string') swagger = swagger.toString();

  if (swagger.indexOf('1') === 0) return 'swagger_1';
  else if (swagger.indexOf('2') === 0) return 'swagger_2';
  else throw new Error("Unsupported Swagger version");
}

Types.parse = function(spec, callback) {
  var parsed = null;

  try {
    parsed = JSON.parse(spec);
  } catch(e) {}
  if (parsed) return callback(null, parsed);

  try {
    parsed = YAML.parse(spec);
  } catch(e) {}
  if (parsed) return callback(null, parsed);

  Protagonist.parse(spec, function(err, apibp) {
    if (err) return callback(new Error("Unsupported format. Spec must be valid JSON, YAML, or Markdown"));
    else return callback(null, apibp.ast);
  });
}

Types.requestUrl = function (url, callback) {
  Request(url, function(err, response, spec) {
    if (err) {
      callback(err);
      return;
    }
    Types.parse(spec, callback);
  });
}

Types.readFile = function (filename, callback) {
  FS.readFile(filename, 'utf8', function(err, spec) {
    if (err) {
      callback(err);
      return;
    }
    Types.parse(spec, callback);
  });
}
