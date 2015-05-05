var Utils = module.exports = {};

var YAML = require('yamljs');

Utils.parse = function(spec) {
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
