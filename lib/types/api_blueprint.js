'use strict';

var Promise = require('bluebird');
var Drafter = require('drafter.js');
var Inherits = require('util').inherits;
var BPToSwagger = require('apib2swagger');

var BaseType = require('../base-type.js');

var APIBlueprint = module.exports = function() {
  APIBlueprint.super_.apply(this, arguments);
  this.type = 'api_blueprint';

  this.converters.swagger_2 = Promise.method(apibp => {
    return BPToSwagger.convertParsed(apibp.spec);
  });
}

Inherits(APIBlueprint, BaseType);

APIBlueprint.prototype.formatName = 'apiBlueprint';
APIBlueprint.prototype.supportedVersions = ['1A'];
APIBlueprint.prototype.getFormatVersion = function () {
  //TODO: check version in file.
  return '1A';
}

APIBlueprint.prototype.parsers = {
  'APIB': Promise.method(data => Drafter.parse(data, {type: 'ast'}).ast)
};

APIBlueprint.prototype.checkFormat = function (spec) {
  //TODO: 'spec.ast' isn't working find other criteria.
  return true;
}
