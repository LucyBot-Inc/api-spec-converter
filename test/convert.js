if (typeof window !== "object") {
  require('./setup/node');
}

function convertFile(testCase) {
  var infile = getFileName('input', testCase.in);
  return Converter.convert({
    from: testCase.in.format,
    to: testCase.out.format,
    source: infile
  })
  .then(function (spec) {
    spec.fillMissing();
    return spec;
  });
}

describe('Converter', function() {
  this.timeout(10000);
  TestCases.forEach(function(testCase) {
    var testName = 'should convert ' + testCase.in.file +
      ' from ' + testCase.in.format + ' to ' + testCase.out.format;

    it(testName, function(done) {
      convertFile(testCase)
        .then(function(spec) {
          var outfile = getFileName('output', testCase.out);

          if (WRITE_GOLDEN)
            FS.writeFileSync(outfile, spec.stringify() + '\n');

          getFile(outfile, function(err, golden) {
            try {
              expect(spec.spec).to.deep.equal(golden);
            } catch(e) {
              return done(e);
            }
            done();
          });
        })
        .catch(function (e) {
           done(e);
        });
    })
  })
});


// The "Converter" test suite above validates that all conversions are as expected.
// It focuses on validating that the JavaScript object has the right content.
// It does not check how the object is Marshaled out.
//
// The "Converter & Output Syntax" suite run a few similar tests
// but focuses on validating that the output is json or yaml.
// basically, it tests the various values that can be passed to spec.stringify
describe('Converter & Output Syntax', function() {
  this.timeout(10000);
  SyntaxTestCases.forEach(function(testCase) {
    var testName = 'should convert ' + testCase.in.file +
      ' from ' + testCase.in.format + ' to ' + testCase.out.format +
      ' and output as ' + testCase.out.syntax +
      ' with ' + testCase.out.order + ' order';

    it(testName, function(done) {
      convertFile(testCase)
        .then(function(spec) {
          var  options = {syntax: testCase.out.syntax, order: testCase.out.order}
          var specAsString = spec.stringify(options) + '\n'
          var outfile = getFileName('output', testCase.out);

          if (WRITE_GOLDEN)
            FS.writeFileSync(outfile, specAsString);

          getFileRaw(outfile, function(err, goldenString) {
            try {
            expect(specAsString).to.deep.equal(goldenString);
            } catch(e) {
              return done(e);
            }
            done();
          });
        })
        .catch(function (e) {
           done(e);
        });
    })
  })
});