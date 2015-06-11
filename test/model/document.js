'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = t(db)
	  , document = new Document()

	  , file1 = document.files.newUniq()
	  , file2 = document.files.newUniq()
	  , file3 = document.files.newUniq();

	file1.name = 'foo.js';
	file2.name = 'test.js';
	file3.name = 'bar.js';

	file1.path = '/marko';
	file3.path = '/elo';
	a.deep(aFrom(document.orderedFiles), [file1, file3]);
};
