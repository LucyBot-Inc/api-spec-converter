# AnyAPI

## Installation
**Note: AnyAPI is still in alpha. The API is not stable.**

```bash
npm instal api-spec-converter
```

Convert between API description formats such as Swagger and RAML

## Usage

```js
var AnyAPI = require('api-spec-converter');
AnyAPI.convert({
  from: 'swagger_1',
  to: 'swagger_2',
  url: 'https://api.gettyimages.com/swagger/api-docs',
}, function(err, converted) {
  FS.writeFileSync('swagger2.json', converted);
})

```

## Supported Types

### swagger_1 (Swagger 1.x)
Can be converted to:
* swagger_2
Can be converted from:
* (none)

### swagger_2 (Swagger 2.0)
Can be converted to:
* (none)
Can be converted from:
* swagger_1

