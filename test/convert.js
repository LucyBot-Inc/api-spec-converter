var Path = require('path');
var FS = require('fs');
var Expect = require('chai').expect;

var Converter = require('../index.js');

var TestCases = require('./test-cases.js');

describe('Converter', function() {
  TestCases.forEach(function(testCase) {
    it('should convert ' + testCase.in.file + ' from ' + testCase.in.type + ' to ' + testCase.out.type, function() {
      var infile = Path.join(__dirname, 'input', testCase.in.type, testCase.in.directory || '', testCase.in.file);
      var outfile = Path.join(__dirname, 'output', testCase.out.type, testCase.out.directory || '', testCase.out.file);
      return Converter.convert({
        from: testCase.in.type,
        to: testCase.out.type,
        source: infile,
      })
      .then(function (spec) {
        spec.fillMissing();

        if (process.env.WRITE_GOLDEN)
          return FS.writeFileSync(outfile, spec.stringify() + '\n');

        var golden = JSON.parse(FS.readFileSync(outfile, 'utf8'));
        Expect(spec.spec).to.deep.equal(golden);
      });
    })
  })
});
