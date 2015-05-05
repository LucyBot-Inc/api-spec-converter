var YAML = require('yamljs');

var BaseType = module.exports = function(input) {
  if (typeof input === 'string') {
    this.url = input;
  } else {
    this.spec = input;
  }
  this.type = "base_type";
}

BaseType.prototype.stringify = function() {
  return JSON.stringify(this.spec, null, 2);
}

BaseType.prototype.resolveResources = function(url, callback) {
  callback();
}

BaseType.prototype.convertTo = function(newType) {
  throw new Error("convertTo not implemented for " + this.type);
}
