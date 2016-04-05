'use strict';

var Database   = require('dbjs')
  , defineFile = require('dbjs-ext/object/file');

module.exports = function (t, a) {
	var db                 = new Database()
	  , File               = defineFile(db)
	  , filesToAttachments = t(db)
	  , testFile           = new File();

	a.throws(function () { filesToAttachments(); },
		new RegExp('undefined is not an array'));
	a.deep(filesToAttachments([]), []);
	a.throws(function () { filesToAttachments([ 1 ]); },
		new RegExp('1 is not a File'));
	a.deep(filesToAttachments([ testFile ]), []);
	testFile.name = 'foo';
	testFile.path = 'bar';
	a.deep(filesToAttachments([ testFile ]), [{ filename: 'foo', path: 'bar' }]);
};
