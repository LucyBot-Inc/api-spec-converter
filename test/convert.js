if (typeof window !== "object") {
  require('./setup/node');
}
describe('Converter', function() {
  TestCases.forEach(function(testCase) {
    it('should convert ' + testCase.in.file + ' from ' + testCase.in.type + ' to ' + testCase.out.type, function() {
      var infile = getFileName('input', testCase.in);
      var outfile = getFileName('output', testCase.out);
      return Converter.convert({
        from: testCase.in.type,
        to: testCase.out.type,
        source: infile
      })
      .then(function (spec) {
        spec.fillMissing();

        if (WRITE_GOLDEN)
          return FS.writeFileSync(outfile, spec.stringify() + '\n');

        getFile(outfile, function(err, golden) {
          expect(spec.spec).to.deep.equal(golden);
        });
      });
    })
  })
});
