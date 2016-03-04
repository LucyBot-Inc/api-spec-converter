var TestCases = []

TestCases.push({
  in: {type: 'swagger_1', directory: 'petstore', file: 'index.json'},
  out: {type: 'swagger_2', file: 'petstore.json'}
})

TestCases.push({
  in: {type: 'api_blueprint', file: 'simplest.md'},
  out: {type: 'swagger_2', file: 'simplest.json'}
})

TestCases.push({
  in: {type: 'api_blueprint', file: 'polls_api.md'},
  out: {type: 'swagger_2', file: 'polls.json'},
})

TestCases.push({
  in: {type: 'api_blueprint', file: 'parameters.md'},
  out: {type: 'swagger_2', file: 'parameters.json'},
})

TestCases.push({
  in: {type: 'wadl', file: 'facebook.xml'},
  out: {type: 'swagger_2', file: 'facebook.json'},
})

TestCases.push({
  in: {type: 'wadl', file: 'sample_wadl.wadl'},
  out: {type: 'swagger_2', file: 'sample_wadl.json'},
})

TestCases.push({
  in: {type: 'wadl', file: 'OpenStack_example.wadl'},
  out: {type: 'swagger_2', file: 'OpenStack_example.json'},
})

TestCases.push({
  in: {type: 'wadl', file: 'regex_paths.wadl'},
  out: {type: 'swagger_2', file: 'regex_paths.json'},
})

var IODOCS_FILES = ['usatoday', 'egnyte', 'foursquare', 'klout'];
TestCases = TestCases.concat(IODOCS_FILES.map(function(file) {
  return {
    in: {type: 'io_docs', file: file + '.json'},
    out: {type: 'swagger_2', file: file + '.json'},
  }
}))

TestCases.push({
  in: {type: 'google', file: 'youtube.json'},
  out: {type: 'swagger_2', file: 'youtube.json'}
})

TestCases.push({
  in: {type: 'raml', directory: 'XKCD', file: 'api.raml'},
  out: {type: 'swagger_2', file: 'XKCD.json'}
})

if (typeof module !== 'undefined') {
  module.exports = TestCases;
}

