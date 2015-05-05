# AnyAPI

Convert between API description formats such as Swagger and RAML

Currently only supports conversion from Swagger 1.x to Swagger 2.0

## Installation
**Note: AnyAPI is still in alpha. The API is not stable.**

```bash
npm instal any-api
```

## Usage

```js
var AnyAPI = require('any-api');
AnyAPI.convert({
  from: 'swagger_1',
  to: 'swagger_2',
  url: 'https://api.gettyimages.com/swagger/api-docs',
}, function(err, converted) {
  FS.writeFileSync('swagger2.json', converted);
})

```

## Supported Types

### Swagger 1.x (swagger_1)
Can be converted to:
* swagger_2

Can be converted from:
* (none)

### Swagger 2.0 (swagger_2)
Can be converted to:
* (none)

Can be converted from:
* swagger_1

### RAML (raml)
Not yet implemented

### API Blueprint
Not yet implemented

### I/O Docs (iodocs)
Not yet implemented

## Contributing
Contributions are welcome. I'll try to respond to pull requests within 24 hours.

