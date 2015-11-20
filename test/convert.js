var Path = require('path');
var FS = require('fs');
var Async = require('async');
var Expect = require('chai').expect;

var Converter = require('../index.js');

var TestCases = require('./test-cases.js');

var success = function(outfile, done) {
  return function(err, spec) {
    if (err)
      return done(err);

    try {
      if (process.env.WRITE_GOLDEN) {
        FS.writeFileSync(outfile, spec.stringify() + '\n');
      } else {
        var golden = JSON.parse(FS.readFileSync(outfile, 'utf8'));
        Expect(spec.spec).to.deep.equal(golden);
      }
    } catch (e) {
      return done(e);
    }
    done();
  }
}

describe('Converter', function() {
  TestCases.forEach(function(testCase) {
    it('should convert ' + testCase.in.type + ' to ' + testCase.out.type, function(done) {
      var infile = Path.join(__dirname, 'input', testCase.in.type, testCase.in.directory || '', testCase.in.file);
      var outfile = Path.join(__dirname, 'output', testCase.out.type, testCase.out.directory || '', testCase.out.file);
      Converter.convert({
        from: testCase.in.type,
        to: testCase.out.type,
        source: infile,
      }, success(outfile, done))
    })
  })
});
