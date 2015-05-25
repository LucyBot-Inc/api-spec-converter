'use strict';

var Inherits = require('util').inherits;
var BPToSwagger = require('apib2swagger');

var BaseType = require('./base-type.js');
var Types = require('./types.js');

var APIBlueprint = module.exports = function() {
  APIBlueprint.super_.apply(this, arguments);
  this.type = 'api_blueprint';

  this.converters.swagger_2 = function(apibp, callback) {
    var swagger2 = BPToSwagger.convertParsed(apibp.spec);
    callback(null, new Types.swagger_2(swagger2));
  }
}

Inherits(APIBlueprint, BaseType);

APIBlueprint.prototype.checkFormat = function (spec) {
  //TODO: 'spec.ast' isn't working find other criteria.
  return true;
}
