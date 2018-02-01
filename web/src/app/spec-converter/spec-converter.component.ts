import {Component} from '@angular/core';

import {PlatformService} from '../services/platform.service';

declare let APISpecConverter:any;

import {saveAs} from 'file-saver';

@Component({
    selector: 'spec-converter',
    templateUrl: './spec-converter.pug',
    styles: [`
      button[type="submit"] {
        margin-top: 12px;
        float: right;
      }

      .output-spec {
        margin-top: 50px;
      }
    `]
})
export class SpecConverterComponent {
  spec:any;
  error:string;
  running:boolean;

  convertFrom:string;
  convertTo:string;
  convertSource:string;

  formats:string[]=[];
  skipFormats = ['api_blueprint'];
  destinationFormats = ['swagger_2', 'openapi_3'];
  formatLabels = {
    swagger_1: 'Open API 1.x (Swagger)',
    swagger_2: 'Open API 2.0 (Swagger)',
    openapi_3: 'Open API 3.0',
    io_docs: 'I/O Docs',
    api_blueprint: 'API Blueprint',
    google: 'Google Discovery',
    raml: 'RAML',
    wadl: 'WADL',
  };
  examples = [
    {from: 'swagger_1', source: 'https://raw.githubusercontent.com/LucyBot-Inc/api-spec-converter/master/test/input/swagger_1/petstore/index.json'},
    {from: 'swagger_2', to: 'openapi_3', source: 'https://api.apis.guru/v2/specs/bufferapp.com/1/swagger.json'},
    {from: 'wadl', source: 'https://api.apigee.com/v1/consoles/facebook/apidescription?format=wadl'},
    {from: 'raml', source: 'https://raw.githubusercontent.com/raml-apis/XKCD/master/api.raml'},
    {from: 'google', source: 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'},
    //{from: 'api_blueprint', source: 'https://raw.githubusercontent.com/apiaryio/api-blueprint/master/examples/Polls%20API.md'},
    {from: 'io_docs', source: 'https://raw.githubusercontent.com/lucybot/api-spec-converter/master/test/input/io_docs/foursquare.json'},
  ];

  constructor(public platform:PlatformService) {
    this.setExample(this.examples[0]);
    if (this.platform.isBrowser()) {
      this.formats = Object.keys(APISpecConverter.Formats);
    }
  }

  stringify(obj) {
    return JSON.stringify(obj, null, 2);
  }

  setExample(example) {
    this.convertFrom = example.from;
    this.convertTo = example.to || 'swagger_2';
    this.convertSource = example.source;
  }

  convert() {
    this.error = this.spec = null;
    this.running = true;
    APISpecConverter.convert({from: this.convertFrom, to: this.convertTo, source: this.convertSource})
      .then(
        spec => this.spec = spec.spec,
        err => {
          this.error = err;
          console.log(err);
        }
      )
      .then(_ => this.running = false);
  }

  download() {
    var blob = new Blob([this.stringify(this.spec)], {type: 'application/json;charset=utf-8'});
    saveAs(blob, 'swagger.json');
  }
}
