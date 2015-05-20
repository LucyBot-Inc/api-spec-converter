# api-spec-converter

[![NPM version][npm-image]][npm-link]
[![Build status][travis-image]][travis-link]
[![Code climate][climate-image]][climate-link]
[![Dependency status][deps-image]][deps-link]
[![devDependency status][devdeps-image]][devdeps-link]

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

[npm-image]: https://img.shields.io/npm/v/api-spec-converter.svg
[npm-link]: https://npmjs.org/package/api-spec-converter
[travis-image]: https://img.shields.io/travis/lucybot/api-spec-converter.svg
[travis-link]: https://travis-ci.org/lucybot/api-spec-converter
[climate-image]: https://img.shields.io/codeclimate/github/lucybot/api-spec-converter.svg
[climate-link]: https://codeclimate.com/github/lucybot/api-spec-converter
[deps-image]: https://img.shields.io/david/lucybot/api-spec-converter.svg
[deps-link]: https://david-dm.org/lucybot/api-spec-converter
[devdeps-image]: https://img.shields.io/david/dev/lucybot/api-spec-converter.svg
[devdeps-link]: https://david-dm.org/lucybot/api-spec-converter#info=devDependencies
