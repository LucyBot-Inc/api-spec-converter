'use strict';

var FS = require('fs');
var Request = require('request');
var YAML = require('yamljs');

module.exports.parseJSON = function (data, callback) {
  try {
    var json = JSON.parse(data);
  } catch(e) {
    callback(Error('JSON: ' + e));
    return;
  }
  callback(null, json);
};

module.exports.parseYAML = function (data, callback) {
  try {
    var yaml = YAML.parse(data);
  } catch(e) {
    callback(Error('YAML: ' + e));
    return;
  }
  callback(null, yaml);
};

module.exports.readUrl = function (url, callback) {
  Request(url, function(err, response, spec) {
    //TODO: check if status 200
    callback(err, spec);
  });
};

module.exports.readFile = function (filename, callback) {
  FS.readFile(filename, 'utf8', callback);
};

module.exports.readSpec = function (options, callback) {
  if (options.spec)
    callback(null, options.spec);
  else if (options.url)
    module.exports.readUrl(options.url, callback);
  else if (options.file)
    module.exports.readFile(options.file, callback);
  else
    callback(Error());
};
