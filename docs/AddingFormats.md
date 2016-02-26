These are instructions for adding new formats to api-spec-converter.
New formats can be created inside this repository, or added from an external project that depends on api-spec-converter

If the format you're adding is a popular/open format like Swagger or RAML, please contribute your work to this repository.
If you're adding a proprietary format, please create a separate package that depends on api-spec-converter (see the last section of this document).

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
* Call util.inherits(myType, BaseType)

Additionally, types MAY override the following functions and fields:
* `formatName` - A versionless name for this format (e.g. 'swagger'). This is useful if different versions of a single format are handled by separate types in api-spec-converter (as swagger_1 and swagger_2 are)
* `supportedVersions` - An array of version strings. If getFormatVersion() returns something other than what's in this array, an error will be throw
* `getFormatVersion` - returns the format version that the spec being converted was written in (e.g. Swagger 2.0, RAML 1.0)
* `parsers` - An array of functions that will parse this format from a string into a JS object. Each function should have the footprint `function(data, callback)`, where `callback` has the footprint `function(err, parsed)`. Each parser will be tried in-order until one returns successfully.
* `fixSpec` - A function (with no arguments) that fixes possible validation errors in the parsed spec
* `validate` - A function with footprint `function(callback)` that checks to make sure the parsed spec is valid. The callback has footprint `function(errors, warnings)`
* `listSubResources` - A function that returns an array URLs or filenames from the parsed spec which should also be resolved and parsed. These resources will be made available in the `type.subResources` field. Some types, like RAML, simply do subresource resolution inside of their `parsers`

### Format Versions
Generally speaking, different versions of the same format belong in the same type (e.g. RAML 0.8 and RAML 1.0).
However, if there are substantial changes between versions (such as with Swagger 1.x and Swagger 2.0), or if there's a need to be able to convert between different versions of the same format, you can create a separate type.

This is why we have separate keys for swagger_1 and swagger_2, but only one key (raml) for RAML 0.8 and RAML 1.0

## Creating Conversions
Conversion functions should be declared in your type's constructor as `this.converters[to_type]`.
You should have one conversion function for each type you will convert to.
Each converter has a footprint `function(fromSpec, callback)`, where callback has the footprint `function(err, converted)`

Conversion functions generally rely on external libraries for most of the logic, though this is not necessary.

For example, here's the swagger_1 -> swagger_2 conversion, inside `./lib/types/swagger_1.js`:

```js
var SwaggerConverter = require('swagger-converter');
var Swagger1 = module.exports = function() {
  Swagger1.super_.apply(this, arguments);
  this.type = 'swagger_1';

  this.converters.swagger_2 = function(swagger1, callback) {
    try {
      var swagger2 = SwaggerConverter.convert(swagger1.spec, swagger1.subResources);

      if (swagger2.info.title === 'Title was not specified')
        swagger2.info.title = swagger2.host;
    } catch(e) {
      return callback(e);
    }
    return callback(null, swagger2);
  }
}
```

## Internal Types
If you're adding your type inside this package, you should:
* Write your type's logic in `./lib/types/<type_name>.js`
* Add your type to `./lib/types.js`
* Update README.md

where `<type_name>` is an identifier for your type, e.g. swagger_2 or raml.

## External Types
If you're adding a type from outside this repository (e.g. a proprietary type), you should:
* Write your type's logic in `<type_name>.js` inside your repository
* Set `require('api-spec-converter').Types["<type_name>"] = require('./<type_name>.js')

Then you can call `Converter.convert()` with `<type_name>` just as you would with other format names.

See [kaltura-spec-converter](https://github.com/bobby-brennan/kaltura-spec-converter/blob/master/index.js) for an example.
