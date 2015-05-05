var Types = require('./lib/types.js');

var Converter = module.exports = {};

Converter.convert = function(options, callback) {
  var fromSpec = options.url ? new Types[options.from](options.url) : Types.build(options.spec, options.from);
  fromSpec.maybeResolveFromUrl(function() {
    var toSpec = fromSpec.convertTo(options.to);
    callback(null, toSpec);
  });
}
