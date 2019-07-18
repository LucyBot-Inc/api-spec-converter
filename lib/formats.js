'use strict';

var Formats = module.exports = {};

function ignoreModuleNodeFound(e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
}

// some modules do require optionalDependencies, we silently catch loading if
// that does not work, and we will warn user when he will try using it
try {
  Formats.swagger_1 = require('./formats/swagger_1.js');
} catch (e) {
  ignoreModuleNodeFound(e);
}
try {
  Formats.swagger_2 = require('./formats/swagger_2.js');
} catch (e) {
  ignoreModuleNodeFound(e);
}
try {
  Formats.openapi_3 = require('./formats/openapi_3.js');
} catch (e) {
  ignoreModuleNodeFound(e);
}
try {
  Formats.api_blueprint = require('./formats/api_blueprint.js');
} catch (e) {
  ignoreModuleNodeFound(e);
}
Formats.io_docs = require('./formats/io_docs.js');
try {
  Formats.google = require('./formats/google.js');
} catch (e) {
  ignoreModuleNodeFound(e);
}
try {
  Formats.raml = require('./formats/raml.js');
} catch (e) {
  ignoreModuleNodeFound(e);
}
Formats.wadl = require('./formats/wadl.js');
