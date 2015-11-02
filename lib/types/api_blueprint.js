'use strict';

var Protagonist = require('protagonist');
var Inherits = require('util').inherits;
var BPToSwagger = require('apib2swagger');

var BaseType = require('./base-type.js');
var Types = require('./types.js');

var APIBlueprint = module.exports = function() {
  APIBlueprint.super_.apply(this, arguments);
  this.type = 'api_blueprint';

  this.converters.swagger_2 = function(apibp, callback) {
    try {
      var swagger2 = BPToSwagger.convertParsed(apibp.spec);
    } catch(e) {
      return callback(e);
    }
    callback(null, new Types.swagger_2(swagger2));
  }
}

Inherits(APIBlueprint, BaseType);

APIBlueprint.prototype.formatName = 'apiBlueprint';
APIBlueprint.prototype.supportedVersions = ['1A'];
APIBlueprint.prototype.getFormatVersion = function () {
  //TODO: check version in file.
  return '1A';
}

APIBlueprint.prototype.parsers = [ function (data, callback) {
  Protagonist.parse(data, function(err, apibp) {
    if (err)
      callback(Error('Makrdown: ' + err));
    else
      callback(null, apibp.ast);
  });
}];

APIBlueprint.prototype.checkFormat = function (spec) {
  //TODO: 'spec.ast' isn't working find other criteria.
  return true;
}
