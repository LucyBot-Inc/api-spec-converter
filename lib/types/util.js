'use strict';

var FS = require('fs');
var Request = require('request');
var YAML = require('yamljs');
var _ = require('lodash');
var URI = require('URIjs');

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

module.exports.readSpec = function (source, callback) {
  if (_.isObject(source)) {
    callback(null, source);
    return;
  }

  if (!_.isString(source)) {
    callback(Error('Spec source should be object, string, URL or filename.'));
    return;
  }

  var uri = new URI(source);
  if (uri.is('absolute'))
    module.exports.readUrl(source, callback);
  else if (uri.is('relative'))
    module.exports.readFile(source, callback);
  else
    callback(null, source);
};
