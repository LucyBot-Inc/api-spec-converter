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
