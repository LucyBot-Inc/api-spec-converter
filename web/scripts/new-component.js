const args = require('yargs').argv;
const fs = require('fs');

let componentCode = function(name, filename) {
  return `
import {Component} from '@angular/core';

@Component({
    selector: '${filename}',
    templateUrl: './${filename}.pug',
})
export class ${name}Component {
  constructor() {}
}
  `.trim()
}

let viewCode = function(name) {
  return `
h1 ${name}
  `.trim();
}

const APP_DIR = __dirname + '/../src/app/';

const filename = args.name.toLowerCase().replace(/\s/g, '-');
const componentName = args.name.replace(/\s/g, '');
const componentDir = APP_DIR + filename + '/';
const componentFile = componentDir + filename + '.component.ts';
const viewFile = componentDir + filename + '.pug';
const appFile = APP_DIR + 'app.module.ts';

let component = componentCode(componentName, filename);
let view = viewCode(args.name);

fs.mkdirSync(componentDir);
fs.writeFileSync(viewFile, view);
fs.writeFileSync(componentFile, component);

let app = fs.readFileSync(appFile, 'utf8');
let lines = app.split('\n').reverse();

let insertImportAt = lines.findIndex(l => l.match(/^import .* from '\.\/.*.component'/));
lines.splice(insertImportAt, 0, `import {${componentName}Component} from './${filename}/${filename}.component'`);

let insertDeclarationAt = lines.findIndex(l => l.match(/^\s+\w+Component,/));
lines.splice(insertDeclarationAt, 0, `    ${componentName}Component,`)

lines.reverse();
fs.writeFileSync(appFile, lines.join('\n'));
