var FS = require('fs');
var Expect = require('chai').expect;

var Converter = require('../index.js');

var SWAGGER_1_TO_2 = {
  in: __dirname + '/input/swagger_1/petstore/index.json',
  out: __dirname + '/golden/petstore.json'
}

var APIBP_TO_SWAGGER_2 = {
  in: __dirname + '/input/api_blueprint/simplest.md',
  out: __dirname + '/golden/simplest.json'
}

var POLLS_API = {
  in: __dirname + '/input/api_blueprint/polls_api.md',
  out: __dirname + '/golden/polls.json',
}

var PARAMETERS = {
  in: __dirname + '/input/api_blueprint/parameters.md',
  out: __dirname + '/golden/parameters.json',
}

var success = function(outfile, done) {
  return function(err, spec) {
    Expect(err).to.equal(null);
    spec = spec.stringify();
    if (process.env.WRITE_GOLDEN) {
      FS.writeFileSync(outfile, spec);
    } else {
      Expect(spec).to.equal(FS.readFileSync(outfile, 'utf8'));
    }
    done();
  }
}

describe('Converter', function() {
  it('should convert swagger_1 to swagger_2', function(done) {
    var files = SWAGGER_1_TO_2;
    Converter.convert({
      from: 'swagger_1',
      to: 'swagger_2',
      file: files.in,
    }, success(files.out, done));
  });

  it('should convert api_blueprint to swagger_2', function(done) {
    var files = APIBP_TO_SWAGGER_2;
    Converter.convert({
      from: 'api_blueprint',
      to: 'swagger_2',
      file: files.in,
    }, success(files.out, done));
  });

  it('should convert polls api_blueprint to swagger_2', function(done) {
    var files = POLLS_API;
    Converter.convert({
      from: 'api_blueprint',
      to: 'swagger_2',
      file: files.in,
    }, success(files.out, done));
  });

  it('should convert api_blueprint parameters to swagger_2 parameters', function(done) {
    var files = PARAMETERS;
    Converter.convert({
      from: 'api_blueprint',
      to: 'swagger_2',
      file: files.in,
    }, success(files.out, done));
  })
});
