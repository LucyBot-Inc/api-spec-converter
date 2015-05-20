'use strict';

var FS = require('fs');
var Request = require('request');

var Types = module.exports = {};

Types.base_type = require('./base-type.js');
Types.swagger_1 = require('./swagger_1.js');
Types.swagger_2 = require('./swagger_2.js');

Types.build = function(spec, type) {
  if (typeof spec === 'string') {
    spec = Types.parse(spec);
  }
  if (!type) {
    type = Types.getType(spec);
  }
  return new Types[type](spec);
}

Types.getType = function(spec) {
  var swagger = spec.swagger || spec.swaggerVersion;
  if (!swagger) {
    throw new Error("Unsupported spec type");
  }
  if (typeof swagger !== 'string') swagger = swagger.toString();

  if (swagger.indexOf('1') === 0) return 'swagger_1';
  else if (swagger.indexOf('2') === 0) return 'swagger_2';
  else throw new Error("Unsupported Swagger version");
}

Types.parse = function(spec) {
  try {
    spec = JSON.parse(spec);
  } catch(e) {
    try {
      spec = YAML.parse(spec);
    } catch(e) {
      throw new Error("Unsupported format. Spec must be valid JSON or YAML.");
    }
  }
  return spec;
}

Types.requestUrl = function (url, callback) {
  Request(url, function(err, response, spec) {
    if (err) {
      callback(err);
      return;
    }
    try {
      spec = Types.parse(spec);
    } catch(e) {
      callback(e);
      return;
    }
    callback(null, spec);
  });
}

Types.readFile = function (filename, callback) {
  FS.readFile(filename, 'utf8', function(err, spec) {
    if (err) {
      callback(err);
      return;
    }
    try {
      spec = Types.parse(spec);
    } catch(e) {
      callback(e);
      return;
    }
    callback(null, spec);
  });
}
