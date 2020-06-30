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
  in: {format: 'openapi_3', file: 'deprecated.yml'},
  out: {format: 'swagger_2', file: 'deprecated.yml'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'swagger_2', file: 'petstore.json'},
  out: {format: 'openapi_3', file: 'petstore2.json'}
})

TestCases.push({
  in: {format: 'openapi_3', file: 'petstore.json'},
  out: {format: 'swagger_2', file: 'petstore_from_oas3.json'}
})

TestCases.push({
  in: {format: 'openapi_3', file: 'minimal.json'},
  out: {format: 'swagger_2', file: 'minimal.json'}
})

TestCases.push({
  in: {format: 'openapi_3', file: 'produces.yml'},
  out: {format: 'swagger_2', file: 'produces.json'}
})

TestCases.push({
  in: {format: 'openapi_3', file: 'param_schema_ref.yml'},
  out: {format: 'swagger_2', file: 'param_schema_ref.json'}
})

TestCases.push({
  in: {format: 'openapi_3', file: 'servers.yml'},
  out: {format: 'swagger_2', file: 'servers.json'}
})

TestCases.push({
  in: {format: 'openapi_3', file: 'slash_ref.yml'},
  out: {format: 'swagger_2', file: 'slash_ref.json'}
})

TestCases.push({
  in: {format: 'openapi_3', file: 'has_external_ref.json'},
  out: {format: 'swagger_2', file: 'has_external_ref.json'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'openapi_3', file: 'yaml_with_ref.yml'},
  out: {format: 'swagger_2', file: 'yaml_with_ref.yml', syntax: 'yaml'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'openapi_3', file: 'common_params.json'},
  out: {format: 'swagger_2', file: 'common_params.json'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'openapi_3', file: 'form_param.yml'},
  out: {format: 'swagger_2', file: 'form_param.yml', syntax: 'yaml'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'openapi_3', file: 'nullable.yml'},
  out: {format: 'swagger_2', file: 'nullable.yml', syntax: 'yaml'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'openapi_3', file: 'nested_oneof.yml'},
  out: {format: 'swagger_2', file: 'nested_oneof.yml', syntax: 'yaml'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'openapi_3', file: 'request_response_ref.yml'},
  out: {format: 'swagger_2', file: 'request_response_ref.yml', syntax: 'yaml'},
  skipBrowser: true,
})

TestCases.push({
  in: {format: 'openapi_3', file: 'multiple_ref.yml'},
  out: {format: 'swagger_2', file: 'multiple_ref.json', syntax: 'json'},
  skipBrowser: true,
})

var openapi3Cases = [];

TestCases.forEach(function(testCase) {
  if (testCase.out.format === 'swagger_2' && testCase.in.format !== 'openapi_3') {
    var newCase = JSON.parse(JSON.stringify(testCase));
    newCase.out.format = 'openapi_3';
    openapi3Cases.push(newCase);
  }
})

TestCases = TestCases.concat(openapi3Cases);

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
