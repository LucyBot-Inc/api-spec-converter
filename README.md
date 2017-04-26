# api-spec-converter
[![Share on Twitter][twitter-image]][twitter-link]

[![Chat on gitter][gitter-image]][gitter-link]
[![NPM version][npm-image]][npm-link]
[![Bower version][bower-image]][bower-link]
[![Build status][travis-image]][travis-link]

[![Code climate][climate-image]][climate-link]
[![Dependency status][deps-image]][deps-link]
[![devDependency status][devdeps-image]][devdeps-link]

Convert between API description formats such as [Swagger](http://swagger.io/) and [RAML](http://raml.org/)

**Currently only supports conversion to OpenAPI(fka Swagger) 2.0 format**

You can also use the online version at https://lucybot.github.io/api-spec-converter

## Installation

### Command Line
```bash
npm install -g api-spec-converter
```

### NodeJS/Browser
```bash
npm install --save api-spec-converter
```

## Usage

### Command Line
```bash
$ api-spec-converter -h

  Usage: api-spec-converter [options] <URL|filename>

  Convert API descriptions between popular formats.

  Supported formats:
    * swagger_1
    * swagger_2
    * api_blueprint
    * io_docs
    * google
    * raml
    * wadl

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -f, --from <format>  Specifies format to convert
    -t, --to <format>    Specifies output format
    -c, --check          Check if result is valid spec
    -d, --dummy          Fill missing required fields with dummy data
```

Example:
```bash
$ api-spec-converter https://api.gettyimages.com/swagger/api-docs --from=swagger_1 --to=swagger_2 > swagger.json
```

### NodeJS

### Options
* `from` - source format (see formats below)
* `to` - desired format (see formats below)
* `source` - Filename or URL for the source
### Simple example:
```js
var Converter = require('api-spec-converter');

Converter.convert({
  from: 'swagger_1',
  to: 'swagger_2',
  source: 'https://api.gettyimages.com/swagger/api-docs',
}, function(err, converted) {
  console.log(converted.stringify());
})
```
### Callback vs Promises
This library has full support for both callback and promises.
All async functions return promises but also will execute callback if provided.

```js
var Converter = require('api-spec-converter');

Converter.convert({
  from: 'swagger_1',
  to: 'swagger_2',
  source: 'https://api.gettyimages.com/swagger/api-docs',
})
.then(function(converted) {
  console.log(converted.stringify());
});
```
### Advanced features:
```js
var Converter = require('api-spec-converter');
Converter.convert({
  from: 'swagger_1',
  to: 'swagger_2',
  source: 'https://api.gettyimages.com/swagger/api-docs',
})
  .then(function(converted) {
    // [Optional] Fill missing fields with dummy values
    converted.fillMissing();

    // [Optional] Validate converted spec
    return converted.validate()
      .then(function (result) {
        if (result.errors)
          return console.error(JSON.stringify(errors, null, 2));
        if (result.warnings)
          return console.error(JSON.stringify(warnings, null, 2));

        console.log(converted.stringify());
        FS.writeFileSync('swagger2.json', converted.stringify());
      });
  });
```

### Browser
```js
<script src="node_modules/api-spec-converter/dist/api-spec-converter.js"></script>
APISpecConverter.convert(...)
```

## Supported Formats

* [Swagger 1.x](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/1.2.md) (swagger_1)
* [OpenAPI(fka Swagger) 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) (swagger_2)
* [I/O Docs](https://github.com/mashery/iodocs) (io_docs)
* [API Blueprint](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md) (api_blueprint)
* [Google API Discovery](https://developers.google.com/discovery/v1/reference/apis) (google)
* [RAML](http://raml.org/spec.html) (raml)
* [WADL](http://www.w3.org/Submission/wadl/) (wadl)


## Conversion Table

|from:             |swagger_1|swagger_2|io_docs|api_blueprint|google|raml|wadl|
-------------------|:-------:|:-------:|:-----:|:-----------:|:----:|:--:|:--:|
|to swagger_1      |  n/a    |         |       |             |      |    |    |
|to swagger_2      | :white_check_mark: |    n/a  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|to io_docs        |         |         |  n/a  |             |      |    |    |
|to api_blueprint  |         |         |       |    n/a      |      |    |    |
|to google         |         |         |       |             |  n/a |    |    |
|to raml           |         |         |       |             |      | n/a|    |
|to wadl           |         |         |       |             |      |    | n/a|

## Contributing
Contributions are welcome and encouraged. See [docs/Contributing.md](docs/Contributing.md) for instructions, tips, and starter projects.

[twitter-image]: https://img.shields.io/twitter/url/http/lucybot.github.io/api-spec-converter.svg?style=social
[twitter-link]: https://twitter.com/intent/tweet?text=Convert+between+API+description+formats+such+as+Swagger+and+RAML:&url=http%3A%2F%2Flucybot.github.io%2Fapi-spec-converter
[gitter-image]: https://img.shields.io/gitter/room/lucybot/api-spec-converter.svg
[gitter-link]: https://gitter.im/lucybot/api-spec-converter
[npm-image]: https://img.shields.io/npm/v/api-spec-converter.svg
[npm-link]: https://npmjs.org/package/api-spec-converter
[bower-image]: https://img.shields.io/bower/v/api-spec-converter.svg
[bower-link]: http://bower.io/
[travis-image]: https://img.shields.io/travis/lucybot/api-spec-converter.svg
[travis-link]: https://travis-ci.org/lucybot/api-spec-converter
[climate-image]: https://img.shields.io/codeclimate/github/lucybot/api-spec-converter.svg
[climate-link]: https://codeclimate.com/github/lucybot/api-spec-converter
[deps-image]: https://img.shields.io/david/lucybot/api-spec-converter.svg
[deps-link]: https://david-dm.org/lucybot/api-spec-converter
[devdeps-image]: https://img.shields.io/david/dev/lucybot/api-spec-converter.svg
[devdeps-link]: https://david-dm.org/lucybot/api-spec-converter#info=devDependencies
