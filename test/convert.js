var FS = require('fs');
var Expect = require('chai').expect;

var Converter = require('../index.js');

var GETTY_GOLDEN = __dirname + '/golden/getty.swagger_2';

describe('Converter', function() {
  it('should convert swagger_1 to swagger_2', function(done) {
    this.timeout(5000);
    Converter.convert({
      from: 'swagger_1',
      to: 'swagger_2',
      url: 'https://api.gettyimages.com/swagger/api-docs',
    }, function(spec) {
      console.log('got spec');
      if (process.env.WRITE_GOLDEN) {
        FS.writeFileSync(GETTY_GOLDEN, spec);
      } else {
        Expect(spec).to.equal(FS.readFileSync(GETTY_GOLDEN, 'utf8'));
      }
      done();
    })
  })
})
