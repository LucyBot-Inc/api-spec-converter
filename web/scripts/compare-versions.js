let fs = require('fs');
let path = require('path');
let args = require('yargs').argv;

function addDirToVersions(dir, versions) {
  fs.readdirSync(dir).forEach(d => {
    if (d.indexOf('.') === 0) {
      return;
    }
    if (d.indexOf('@') === 0) {
      addDirToVersions(dir + '/' + d, versions);
    } else {
      let pkg = require(dir + '/' + d + '/package.json');
      versions[d] = pkg.version;
    }
  })
}

let aVersions = {};
addDirToVersions(path.resolve(args.a + '/node_modules'), aVersions);
let bVersions = {};
addDirToVersions(path.resolve(args.b + '/node_modules'), bVersions);

let keys = Object.keys(aVersions);
for (let key in bVersions) {
  if (keys.indexOf(key) === -1) keys.push(key);
}

keys.forEach(key => {
  let v1 = aVersions[key];
  let v2 = bVersions[key];
  if (v1 !== v2) {
    console.log(key + '\t' + aVersions[key] + '\t' + bVersions[key]);
  }
})
