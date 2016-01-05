These are instructions for adding new formats to api-spec-converter.
New formats can be created inside this repository, or added from an external project that depends on api-spec-converter

If the format you're adding is a popular/open format like Swagger or RAML, please contribute your work to this repository.
If you're adding a proprietary format, please create a separate package that depends on api-spec-converter.

## Creating the Type
api-spec-converter exposes a BaseType, which is extended by all other types.
Individual types override BaseType's fields and functions where necessary.

For example, here's the Swagger 2.0 type:

`./lib/types/swagger_2.js`
```js
var BaseType = require('../base-type.js');
var Inherits = require('util').inherits;
var Util = require('../util.js');

var Swagger2 = module.exports = function() {
  Swagger2.super_.apply(this, arguments);
  this.type = 'swagger_2';
}

Inherits(Swagger2, BaseType);

Swagger2.prototype.formatName = 'swagger';
Swagger2.prototype.supportedVersions = ['2.0'];
Swagger2.prototype.getFormatVersion = function () {
  return this.spec.swagger;
}
```

All types MUST:
* Supply a constructor that
  * calls super_.apply(this, arguments)
  * sets this.type to the type's key (e.g. swagger_2, api_blueprint)
* Call Inherits(myType, BaseType)

Additionally, types MAY override the following functions and fields:
* `formatName` - A versionless name for this format (e.g. 'swagger')
* `supportedVersions` - An array of version strings. If getFormatVersion() returns something other than what's in this array, an error will be throw
* `getFormatVersion` - returns the format version that the spec being converted was written in (e.g. Swagger 2.0, RAML 1.0)
* `parsers` - An array of functions that will parse this format from a string into a JS object. Each function should have the footprint `function(data, callback)`, where `callback` has the footprint `function(err, parsed)`. Each parser will be tried in-order until one returns successfully.
* `fixSpec` - A function (with no arguments) that fixes possible validation errors in the parsed spec
* `validate` - A function with footprint `function(callback)` that checks to make sure the parsed spec is valid. The callback has footprint `function(errors, warnings)`
* `listSubResources` - A function that returns an array URLs or filenames from the parsed spec which should also be resolved and parsed. These resources will be made available in the `type.subResources` field.


