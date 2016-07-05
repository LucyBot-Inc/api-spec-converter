var host = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')

window.getFileName = function(type, testCaseItem) {
  var file = testCaseItem.type;
  if (testCaseItem.directory) file += '/' + testCaseItem.directory;
  file += '/' + testCaseItem.file;
  return host + '/test/' + type + '/' +file;
}

window.getFile = function(file, cb) {
  var xobj = new XMLHttpRequest();
  xobj.open('GET', file, true);
  xobj.onload = function () {
    if (xobj.status === 200)
      cb(null, JSON.parse(xobj.response));
    else
      cb(Error(xobj.status + ': Failed to load ' + file));
  };
  xobj.send(null);
}

window.WRITE_GOLDEN = false;
window.expect = window.chai.expect;
window.Converter = APISpecConverter;
