var fs = require('fs');
var path = require('path');

global.getFileName = function(dir, testCase) {
  return path.join(__dirname, '..', dir, testCase.format, testCase.directory || '', testCase.file);
}

global.getFile = function(file, cb) {
  var res = JSON.parse(fs.readFileSync(file, 'utf8'));
  cb(null, res);
}

global.expect = require('chai').expect;
global.FS = fs;

global.WRITE_GOLDEN = process.env.WRITE_GOLDEN;
global.Converter = require('../../index.js');

global.TestCases = require('./../test-cases.js');
