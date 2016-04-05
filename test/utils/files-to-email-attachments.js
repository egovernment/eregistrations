'use strict';

var Database   = require('dbjs')
  , defineFile = require('dbjs-ext/object/file');

module.exports = function (t, a) {
	var db       = new Database()
	  , File     = defineFile(db)
	  , testFile = new File();

	a.deep(t(), []);
	a.throws(function () { t(1); },
		new RegExp('1 is not a File'));
	a.deep(t(testFile), []);
	testFile.name = 'foo';
	testFile.path = 'bar';
	a.deep(t(testFile), [{ filename: 'foo', path: 'bar' }]);
};
