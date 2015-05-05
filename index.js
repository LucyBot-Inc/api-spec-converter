var Request = require('request');
var Types = require('./lib/types.js');

var Converter = module.exports = {};

Converter.convert = function(options, callback) {
  var makeSpec = function() {
    var fromSpec = Types.build(options.spec, options.from);
    fromSpec.resolveResources(options.url, function() {
      var toSpec = fromSpec.convertTo(options.to);
      callback(null, toSpec);
    });
  }
  if (options.url) {
    Request(options.url, function(err, resp, body) {
      if (err) return callback(err);
      options.spec = body;
      makeSpec();
    });
  } else {
    makeSpec();
  }
}
