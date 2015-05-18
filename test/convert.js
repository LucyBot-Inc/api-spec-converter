var FS = require('fs');
var Expect = require('chai').expect;

var Converter = require('../index.js');

var SWAGGER_1 = __dirname + '/input/index.json';
var GOLDEN = __dirname + '/golden/petstore.json';

describe('Converter', function() {
  it('should convert swagger_1 to swagger_2', function(done) {
    this.timeout(5000);
    Converter.convert({
      from: 'swagger_1',
      to: 'swagger_2',
      file: SWAGGER_1,
    }, function(err, spec) {
      Expect(err).to.equal(null);
      spec = spec.stringify();
      if (process.env.WRITE_GOLDEN) {
        FS.writeFileSync(GOLDEN, spec);
      } else {
        Expect(spec).to.equal(FS.readFileSync(GOLDEN, 'utf8'));
      }
      done();
    })
  })
});
