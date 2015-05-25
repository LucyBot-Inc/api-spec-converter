'use strict';

var FS = require('fs');
var Request = require('request');
var Protagonist = require('protagonist');

module.exports.parse = function(spec, callback) {
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

module.exports.requestUrl = function (url, callback) {
  Request(url, function(err, response, spec) {
    if (err) {
      callback(err);
      return;
    }
    module.exports.parse(spec, callback);
  });
}

module.exports.readFile = function (filename, callback) {
  FS.readFile(filename, 'utf8', function(err, spec) {
    if (err) {
      callback(err);
      return;
    }
    module.exports.parse(spec, callback);
  });
}

