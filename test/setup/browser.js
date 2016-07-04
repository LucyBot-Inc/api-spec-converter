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
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4) {
      if (xobj.status === 200) {
        var obj = JSON.parse(xobj.response);
        cb(null, obj);
      } else {
        cb(Error(xobj.status + ': Failed to load ' + file));
      }
    }
  };
  xobj.send(null);
}

window.WRITE_GOLDEN = false;
window.expect = window.chai.expect;
window.Converter = APISpecConverter;
