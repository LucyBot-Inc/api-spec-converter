# api-spec-converter

Convert between API description formats such as [Swagger](http://swagger.io/) and [RAML](http://raml.org/)

Currently only supports conversion from Swagger 1.x to Swagger 2.0

## Installation
**Note: api-spec-converter is still in alpha. The API is not stable.**

```bash
npm install --save api-spec-converter
```

## Usage

```js
var Converter = require('api-spec-converter');
Converter.convert({
  from: 'swagger_1',
  to: 'swagger_2',
  url: 'https://api.gettyimages.com/swagger/api-docs',
}, function(err, converted) {
  console.log(converted.spec);
  FS.writeFileSync('swagger2.json', converted.stringify());
})

```

## Supported Types

### Swagger 1.x (swagger_1)

Can be converted to:
* swagger_2

### Swagger 2.0 (swagger_2)

Can be converted from:
* swagger_1

### RAML (raml)
Not yet implemented

### API Blueprint (api_blueprint)
Not yet implemented

### I/O Docs (io_docs)
Not yet implemented

## Contributing
Contributions are welcome. I'll try to respond to pull requests within 24 hours.
