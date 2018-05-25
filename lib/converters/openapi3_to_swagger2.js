"use strict";

var HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
    SCHEMA_PROPERTIES = ['format', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'minProperties', 'maxProperties', 'additionalProperties', 'pattern', 'enum', 'default'],
    ARRAY_PROPERTIES = ['type', 'items'];

var APPLICATION_JSON_REGEX = /^(application\/json|[^;\/ \t]+\/[^;\/ \t]+[+]json)[ \t]*(;.*)?$/;
var SUPPORTED_MIME_TYPES = {
    APPLICATION_X_WWW_URLENCODED: 'application/x-www-form-urlencoded',
    MUTIPLART_FORM_DATA: 'multipart/form-data',
    APPLICATION_OCTET_STREAM: 'application/octet-stream'
};

var urlParser = require('url');

/**
 * Transforms OpenApi 3.0 to Swagger 2
 */
module.exports = function convert(data) {
  // prepare openApiSpec objects
  var newSpec = JSON.parse(JSON.stringify(data));
  newSpec.swagger = '2.0';
  convertInfos(newSpec);
  convertOperations(newSpec);
  if (newSpec.components) {
    convertSecurityDefinitions(newSpec);
    newSpec.definitions = newSpec.components.schemas;
    delete newSpec.components.schemas;
    newSpec['x-components'] = newSpec.components;
    delete newSpec.components;
    fixRefs(newSpec);
  }
  newSpec.definitions
  return newSpec;
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

function resolveReference(base, obj) {
  var ref = obj.$ref;
  if (!ref) return obj;
  var keys = ref.split('/');
  keys.shift();
  var cur = base;
  keys.forEach(function(k) { cur = cur[k] });
  return cur;
}

/**
 * convert main infos and tags
 */
function convertInfos(openApiSpec) {
    var server = openApiSpec.servers && openApiSpec.servers[0];
    if (server) {
        var match = server.url.match(/(\w+):\/\/([^\/]+)(\/.*)?/);
        if (match) {
          openApiSpec.schemes = [match[1]];
          openApiSpec.host = match[2];
          openApiSpec.basePath = match[3] || '/';
        }
    }
    delete openApiSpec.servers;
    delete openApiSpec.openapi;
}

function convertOperations(openApiSpec) {
    var path, pathObject, method, operation;
    for (path in openApiSpec.paths) {
        pathObject = openApiSpec.paths[path] = resolveReference(openApiSpec, openApiSpec.paths[path]);
        for (method in pathObject) {
            if (HTTP_METHODS.indexOf(method) >= 0) {
                operation = pathObject[method] = resolveReference(openApiSpec, pathObject[method]);
                convertParameters(openApiSpec, operation);
                convertResponses(openApiSpec, operation);
            }
        }
    }
}

function convertParameters(openApiSpec, operation) {
    var content, param, contentKey;
    operation.parameters = operation.parameters || [];
    if (operation.requestBody) {
        param = resolveReference(openApiSpec, operation.requestBody);
        param.name = 'body';
        content = param.content;
        if (content) {
            contentKey = getSupportedMimeTypes(content)[0];
            delete param.content;

            if (contentKey === SUPPORTED_MIME_TYPES.APPLICATION_X_WWW_URLENCODED) {
                operation.consumes = [contentKey];
                param.in = 'formData';
                param.schema = content[contentKey].schema;
                param.schema = resolveReference(openApiSpec, param.schema);
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
            } else if (contentKey === SUPPORTED_MIME_TYPES.MUTIPLART_FORM_DATA) {
                operation.consumes = [contentKey];
                param.in = 'formData';
                param.schema = content[contentKey].schema;
                operation.parameters.push(param);
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
    (operation.parameters || []).forEach(function(param, i) {
        param = operation.parameters[i] = resolveReference(openApiSpec, param);
        copySchemaProperties(param);
        if (param.in !== 'body') {
            copyArrayProperties(param);
            delete param.schema;
            delete param.allowReserved;
            if (param.example) {
                param['x-example'] = param.example;
            }
            delete param.example;
        }
    });
}

function copySchemaProperties(obj) {
    SCHEMA_PROPERTIES.forEach(function(prop) {
        if (obj.schema && obj.schema[prop]) {
            obj[prop] = obj.schema[prop];
            delete obj.schema[prop];
        }
    });
}

function copyArrayProperties(obj) {
    ARRAY_PROPERTIES.forEach(function(prop) {
        if (obj.schema && obj.schema[prop]) {
            obj[prop] = obj.schema[prop];
            delete obj.schema[prop];
        }
    });
}

function convertResponses(openApiSpec, operation) {
    var code, content, contentType, response, resolved, headers;
    for (code in operation.responses) {
        content = false;
        contentType = 'application/json';
        response = operation.responses[code] = resolveReference(openApiSpec, operation.responses[code]);
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
            operation.produces = [contentType];
            response.schema = content.schema;
            resolved = resolveReference(openApiSpec, response.schema);
            if (resolved.type === 'array') {
                response.schema = resolved;
            }
            if (content.example) {
                response.examples = {};
                response.examples[contentType] = content.example;
            }
            copySchemaProperties(response);
        }

        headers = response.headers;
        if (headers) {
            for (var header in headers) {
                // Always resolve headers when converting to v2.
                resolved = resolveReference(openApiSpec, headers[header])
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

function convertSecurityDefinitions(openApiSpec) {
    openApiSpec.securityDefinitions = openApiSpec.components.securitySchemes;
    for (var secKey in openApiSpec.securityDefinitions) {
        var security = openApiSpec.securityDefinitions[secKey];
        if (security.type === 'http' && security.scheme === 'basic') {
            security.type = 'basic';
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
    delete openApiSpec.components.securitySchemes;
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