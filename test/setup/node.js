var fs = require('fs');
var path = require('path');
var YAML = require('js-yaml');

global.getFileName = function(dir, testCase) {
  return path.join(__dirname, '..', dir, testCase.format, testCase.directory || '', testCase.file);
}

// returns file content as a JavaScript
global.getFile = function(file, cb) {
  var content = fs.readFileSync(file, 'utf8');
  var parsed = file.endsWith('json') ? JSON.parse(content) : YAML.safeLoad(content);
  cb(null, parsed);
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

