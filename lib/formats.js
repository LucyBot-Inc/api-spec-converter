'use strict';

var Formats = module.exports = {};

Formats.swagger_1 = require('./formats/swagger_1.js');
Formats.swagger_2 = require('./formats/swagger_2.js');
Formats.openapi_3 = require('./formats/openapi_3.js');
Formats.api_blueprint = require('./formats/api_blueprint.js');
Formats.io_docs = require('./formats/io_docs.js');
Formats.google = require('./formats/google.js');
Formats.raml = require('./formats/raml.js');
Formats.wadl = require('./formats/wadl.js');
