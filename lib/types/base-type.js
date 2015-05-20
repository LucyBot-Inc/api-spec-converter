'use strict';

var YAML = require('yamljs');

var BaseType = module.exports = function(spec) {
  if (spec) this.spec = spec;
  this.type = "base_type";
}

BaseType.prototype.stringify = function() {
  return JSON.stringify(this.spec, null, 2);
}

BaseType.prototype.resolveResources = function(options, callback) {
  if (options.url) {
    Request(options.url, function(err, resp, body) {
      if (err) return callback(err);
      self.spec = body;
      callback();
    });
  } else if (options.file) {
    FS.readFile(options.file, 'utf8', function(err, body) {
      self.spec = body;
      callback();
    })
  } else if (options.spec) {
    self.spec = options.spec;
  }
}

BaseType.prototype.convertTo = function(newType) {
  throw new Error("convertTo not implemented for " + this.type);
}
