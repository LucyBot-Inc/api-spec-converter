'use strict';

var FS = require('fs');
var Path = require('path');
var Request = require('request');
var YAML = require('js-yaml');
var _ = require('lodash');
var URI = require('urijs');
var traverse = require('traverse');

module.exports.joinPath = function () {
  return Path.join.apply(null, arguments).replace(/\\/g, '/');
}

module.exports.parseJSON = function (data, callback) {
  var json;
  try {
    json = JSON.parse(data);
  } catch(e) {
    callback(Error('JSON: ' + e));
    return;
  }
  callback(null, json);
};

module.exports.parseYAML = function (data, callback) {
  var yaml;
  try {
    yaml = YAML.safeLoad(data);
  } catch(e) {
    callback(Error('YAML: ' + e));
    return;
  }
  callback(null, yaml);
};

function readUrl(url, callback) {
  var options = {
    uri: url,
    headers: {
      //TODO: allow different types to define different formats.
      'Accept': 'application/json,*/*',
    }
  };
  new Request(options, function(err, response, data) {
    if (err)
      return callback(err);
    if (response.statusCode !== 200)
      return callback(Error('Can not GET ' + url + ': ' + response.statusMessage));
    callback(null, data);
  });
}

function readFile(filename, callback) {
  FS.readFile(filename, 'utf8', callback);
}

function readDummy(data, callback) {
  callback(null, data);
}

module.exports.resourceReaders = {
  url: readUrl,
  file: readFile,
  object: readDummy,
  string: readDummy,
};

module.exports.getSourceType = function (source) {
  if (_.isObject(source))
    return 'object';
  if (!_.isString(source))
    return undefined;

  var uri = new URI(source);
  if (uri.is('absolute'))
    return 'url';
  else if (uri.is('relative'))
    return 'file';
  else
    return 'string';
};

module.exports.removeNonValues = function (obj) {
  traverse(obj).forEach(function (value) {
    if (value === undefined || value === null)
      this.remove();
  });
}
