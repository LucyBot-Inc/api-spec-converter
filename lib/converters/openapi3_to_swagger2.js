"use strict";

var HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
    SCHEMA_PROPERTIES = ['format', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'minProperties', 'maxProperties', 'additionalProperties', 'pattern', 'enum', 'default'],
    ARRAY_PROPERTIES = ['type', 'items'];

var APPLICATION_JSON_REGEX = /^(application\/json|[^;\/ \t]+\/[^;\/ \t]+[+]json)[ \t]*(;.*)?$/;
var SUPPORTED_MIME_TYPES = {
    APPLICATION_X_WWW_URLENCODED: 'application/x-www-form-urlencoded',
    MULTIPART_FORM_DATA: 'multipart/form-data',
    APPLICATION_OCTET_STREAM: 'application/octet-stream'
};

var npath = require('path');
var fs = require('fs');
var urlParser = require('url');
var YAML = require('js-yaml');

/**
 * Transforms OpenApi 3.0 to Swagger 2
 */
var Converter = module.exports = function(data) {
  this.spec = JSON.parse(JSON.stringify(data.spec));
  if (!data.source.startsWith('http')) {
    this.directory = npath.dirname(data.source);
  }
}

Converter.prototype.convert = function() {
  this.spec.swagger = '2.0';
  this.convertInfos();
  this.convertOperations();
  if (this.spec.components) {
    this.convertSecurityDefinitions();
    this.spec.definitions = this.spec.components.schemas;
    delete this.spec.components.schemas;
    this.spec['x-components'] = this.spec.components;
    delete this.spec.components;
    fixRefs(this.spec);
  }
  return this.spec;
}

function fixRef(ref) {
  return ref
      .replace('#/components/schemas/', '#/definitions/')
      .replace('#/components/', '#/x-components/')
}

function fixRefs(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(fixRefs);
  } else if (typeof obj === 'object') {
    for (var key in obj) {
      if (key === '$ref') {
        obj.$ref = fixRef(obj.$ref);
      } else {
        fixRefs(obj[key]);
      }
    }
  }
}

Converter.prototype.resolveReference = function(base, obj) {
  if (!obj || !obj.$ref) return obj;
  var ref = obj.$ref;
  if (ref.startsWith('#')) {
    var keys = ref.split('/');
    keys.shift();
    var cur = base;
    keys.forEach(function(k) { cur = cur[k] });
    return cur;
  } else if (ref.startsWith('http') || !this.directory) {
    throw new Error("Remote $ref URLs are not currently supported for openapi_3");
  } else {
    let content = fs.readFileSync(npath.join(this.directory, ref), 'utf8');
    let external = null;
    try {
      external = JSON.parse(content);
    } catch (e) {
      try {
        external = YAML.safeLoad(content);
      } catch (e) {
        throw new Error("Could not parse $ref " + ref + " as JSON or YAML");
      }
    }
    return external;
  }
}

/**
 * convert main infos and tags
 */
Converter.prototype.convertInfos = function() {
    var server = this.spec.servers && this.spec.servers[0];
    if (server) {
        var match = server.url.match(/(\w+):\/\/([^\/]+)(\/.*)?/);
        if (match) {
          this.spec.schemes = [match[1]];
          this.spec.host = match[2];
          this.spec.basePath = match[3] || '/';
        }
    }
    delete this.spec.servers;
    delete this.spec.openapi;
}

Converter.prototype.convertOperations = function() {
    var path, pathObject, method, operation;
    for (path in this.spec.paths) {
        pathObject = this.spec.paths[path] = this.resolveReference(this.spec, this.spec.paths[path]);
        this.convertParameters(pathObject); // converts common parameters
        for (method in pathObject) {
            if (HTTP_METHODS.indexOf(method) >= 0) {
                operation = pathObject[method] = this.resolveReference(this.spec, pathObject[method]);
                this.convertOperationParameters(operation);
                this.convertResponses(operation);
            }
        }
    }
}

Converter.prototype.convertOperationParameters = function(operation) {
    var content, param, contentKey;
    operation.parameters = operation.parameters || [];
    if (operation.requestBody) {
        param = this.resolveReference(this.spec, operation.requestBody);
        param.name = 'body';
        content = param.content;
        if (content) {
            contentKey = getSupportedMimeTypes(content)[0];
            delete param.content;

            if (contentKey === SUPPORTED_MIME_TYPES.APPLICATION_X_WWW_URLENCODED
                || contentKey === SUPPORTED_MIME_TYPES.MULTIPART_FORM_DATA) {
                operation.consumes = [contentKey];
                param.in = 'formData';
                param.schema = content[contentKey].schema;
                param.schema = this.resolveReference(this.spec, param.schema);
                if (param.schema.type === 'object' && param.schema.properties) {
                    for (var name in param.schema.properties) {
                      var p = param.schema.properties[name];
                      p.name = name;
                      p.in = 'formData';
                      operation.parameters.push(p);
                    }
                } else {
                    operation.parameters.push(param);
                }
            } else if (contentKey === SUPPORTED_MIME_TYPES.APPLICATION_OCTET_STREAM) {
                operation.consumes = [contentKey];
                param.in = 'formData';
                param.type = 'file';
                param.name = param.name || 'file';
                delete param.schema;
                operation.parameters.push(param);
            } else if (isJsonMimeType(contentKey)) {
                operation.consumes = [contentKey];
                param.in = 'body';
                param.schema = content[contentKey].schema;
                operation.parameters.push(param);
            } else {
                console.warn('unsupported request body media type', operation.operationId, content);
            }
        }
        delete operation.requestBody;
    }
    this.convertParameters(operation);
}

Converter.prototype.convertParameters = function(obj) {
    var param;

    if (obj.parameters === undefined) {
        return;
    }

    obj.parameters = obj.parameters || [];

    (obj.parameters || []).forEach((param, i) => {
        param = obj.parameters[i] = this.resolveReference(this.spec, param);
        this.copySchemaProperties(param, SCHEMA_PROPERTIES);
        if (param.in !== 'body') {
            this.copySchemaProperties(param, ARRAY_PROPERTIES);
            delete param.schema;
            delete param.allowReserved;
            if (param.example) {
                param['x-example'] = param.example;
            }
            delete param.example;
        }
        if (param.type === 'array') {
          let style = param.style || (param.in === 'query' || param.in === 'cookie' ? 'form' : 'simple');
          if (style === 'matrix') {
            param.collectionFormat = param.explode ? undefined : 'csv';
          } else if (style === 'label') {
            param.collectionFormat = undefined;
          } else if (style === 'simple') {
            param.collectionFormat = 'csv';
          } else if (style === 'spaceDelimited') {
            param.collectionFormat = 'ssv';
          } else if (style === 'pipeDelimited') {
            param.collectionFormat = 'pipes';
          } else if (style === 'deepOpbject') {
            param.collectionFormat = 'multi';
          } else if (style === 'form') {
            param.collectionFormat = param.explode === false ? 'csv' : 'multi';
          }
        }
        delete param.style;
        delete param.explode;
    });
}

Converter.prototype.copySchemaProperties = function(obj, props) {
    let schema = this.resolveReference(this.spec, obj.schema);
    if (!schema) return;
    props.forEach(function(prop) {
        if (schema[prop] !== undefined) {
            obj[prop] = schema[prop];
        }
    });
}

Converter.prototype.convertResponses = function(operation) {
    var code, content, contentType, response, resolved, headers;
    for (code in operation.responses) {
        content = false;
        contentType = 'application/json';
        response = operation.responses[code] = this.resolveReference(this.spec, operation.responses[code]);
        if (response.content) {
            if (response.content[contentType]) {
                content = response.content[contentType];
            }
            if (!content) {
                contentType = Object.keys(response.content)[0];
                content = response.content[contentType];
            }
        }
        if (content) {
            operation.produces = operation.produces || []
            if (!operation.produces.includes(contentType)) {
              operation.produces.push(contentType);
            }
            response.schema = content.schema;
            resolved = this.resolveReference(this.spec, response.schema);
            if (resolved && response.schema.$ref && !response.schema.$ref.startsWith('#')) {
                response.schema = resolved;
            }
            if (content.example) {
                response.examples = {};
                response.examples[contentType] = content.example;
            }
            this.copySchemaProperties(response, SCHEMA_PROPERTIES);
        }

        headers = response.headers;
        if (headers) {
            for (var header in headers) {
                // Always resolve headers when converting to v2.
                resolved = this.resolveReference(this.spec, headers[header])
                // Headers should be converted like parameters.
                if (resolved.schema){
                    resolved.type = resolved.schema.type
                    resolved.format = resolved.schema.format
                    delete resolved.schema
                }
                headers[header] = resolved;
            }
        }

        delete response.content;
    }
}

Converter.prototype.convertSecurityDefinitions = function() {
    this.spec.securityDefinitions = this.spec.components.securitySchemes;
    for (var secKey in this.spec.securityDefinitions) {
        var security = this.spec.securityDefinitions[secKey];
        if (security.type === 'http' && security.scheme === 'basic') {
            security.type = 'basic';
            delete security.scheme;
        } else if (security.type === 'http' && security.scheme === 'bearer') {
            security.type = 'apiKey';
            security.name = 'Authorization';
            security.in = 'header';
            delete security.scheme;
            delete security.bearerFormat;
        } else if (security.type === 'oauth2') {
            var flowName = Object.keys(security.flows)[0],
                flow = security.flows[flowName];

            if (flowName === 'clientCredentials') {
                security.flow = 'application';
            } else if (flowName === 'authorizationCode') {
                security.flow = 'accessCode';
            } else {
                security.flow = flowName;
            }
            security.authorizationUrl = flow.authorizationUrl;
            security.tokenUrl = flow.tokenUrl;
            security.scopes = flow.scopes;
            delete security.flows;
        }
    }
    delete this.spec.components.securitySchemes;
}

function isJsonMimeType(type) {
    return new RegExp(APPLICATION_JSON_REGEX, 'i').test(type);
}

function getSupportedMimeTypes(content) {
    var MIME_VALUES = Object.keys(SUPPORTED_MIME_TYPES).map((key) => { return SUPPORTED_MIME_TYPES[key] });
    return Object.keys(content).filter(key => {
        return MIME_VALUES.indexOf(key) > -1 || isJsonMimeType(key);
    });
}
