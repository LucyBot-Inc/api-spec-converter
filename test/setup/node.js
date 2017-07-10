var fs = require('fs');
var path = require('path');

global.getFileName = function(dir, testCase) {
  return path.join(__dirname, '..', dir, testCase.format, testCase.directory || '', testCase.file);
}

// returns file content as a JavaScript
global.getFile = function(file, cb) {
  var res = JSON.parse(fs.readFileSync(file, 'utf8'));
  cb(null, res);
}

// returns file content as a string
global.getFileRaw = function(file, cb) {
  cb(null, fs.readFileSync(file, 'utf8'));
}

global.expect = require('chai').expect;
global.FS = fs;

global.WRITE_GOLDEN = process.env.WRITE_GOLDEN;
global.Converter = require('../../index.js');

global.TestSuites      = require('./../test-cases.js');
global.TestCases       = TestSuites.TestCases;
global.SyntaxTestCases = TestSuites.SyntaxTestCases;

