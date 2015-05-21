'use strict';

var Inherits = require('util').inherits;
var BPToSwagger = require('apib2swagger');

var Types = require('./types.js');

var APIBlueprint = module.exports = function() {
  Types.base_type.apply(this, arguments);
  this.type = 'api_blueprint';

  this.converters.swagger_2 = function(apibp, callback) {
    var swagger2 = BPToSwagger.convertParsed(apibp.spec);
    callback(null, new Types.swagger_2(swagger2));
  }
}

Inherits(APIBlueprint, Types.base_type);
