var TestCases = []

TestCases.push({
  in: {format: 'swagger_1', directory: 'petstore', file: 'index.json'},
  out: {format: 'swagger_2', file: 'petstore.json'}
})

TestCases.push({
  in: {format: 'api_blueprint', file: 'simplest.md'},
  out: {format: 'swagger_2', file: 'simplest.json'}
})

TestCases.push({
  in: {format: 'api_blueprint', file: 'polls_api.md'},
  out: {format: 'swagger_2', file: 'polls.json'},
})

TestCases.push({
  in: {format: 'api_blueprint', file: 'parameters.md'},
  out: {format: 'swagger_2', file: 'parameters.json'},
})

TestCases.push({
  in: {format: 'wadl', file: 'facebook.xml'},
  out: {format: 'swagger_2', file: 'facebook.json'},
})

TestCases.push({
  in: {format: 'wadl', file: 'sample_wadl.wadl'},
  out: {format: 'swagger_2', file: 'sample_wadl.json'},
})

TestCases.push({
  in: {format: 'wadl', file: 'OpenStack_example.wadl'},
  out: {format: 'swagger_2', file: 'OpenStack_example.json'},
})

TestCases.push({
  in: {format: 'wadl', file: 'regex_paths.wadl'},
  out: {format: 'swagger_2', file: 'regex_paths.json'},
})

var IODOCS_FILES = ['usatoday', 'egnyte', 'foursquare', 'klout'];
TestCases = TestCases.concat(IODOCS_FILES.map(function(file) {
  return {
    in: {format: 'io_docs', file: file + '.json'},
    out: {format: 'swagger_2', file: file + '.json'},
  }
}))

TestCases.push({
  in: {format: 'google', file: 'youtube.json'},
  out: {format: 'swagger_2', file: 'youtube.json'}
})

TestCases.push({
  in: {format: 'raml', directory: 'XKCD', file: 'api.raml'},
  out: {format: 'swagger_2', file: 'XKCD.json'}
})

TestCases.push({
  in: {format: 'swagger_2', file: 'petstore.json'},
  out: {format: 'openapi_3', file: 'petstore.json'}
})

//------------------ Json & Yaml test cases -------------------

var SyntaxTestCases = []

SyntaxTestCases.push({
  in: {format: 'swagger_1', directory: 'petstore', file: 'index.json'},
  out: {format: 'swagger_2', file: 'petstore.json', syntax: 'json', order: 'alpha'}
})

SyntaxTestCases.push({
  in: {format: 'swagger_1', directory: 'petstore', file: 'index.json'},
  out: {format: 'swagger_2', file: 'petstore.yaml', syntax: 'yaml', order: 'alpha'}
})

SyntaxTestCases.push({
  in: {format: 'swagger_1', directory: 'petstore', file: 'index.json'},
  out: {format: 'swagger_2', file: 'petstore-oa.yaml', syntax: 'yaml', order: 'openapi'}
})

//---- exports ----

if (typeof module !== 'undefined') {
  module.exports = {TestCases: TestCases, SyntaxTestCases: SyntaxTestCases};
} else {
  // TODO I could not test this branch.
  // It should probably be updated to look like the one in the module block above
  window.TestCases = TestCases;
}
