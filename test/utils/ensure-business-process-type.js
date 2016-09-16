'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = db.Object.extend('BusinessProcess')
	  , Extension = BusinessProcess.extend('BusinessProcessDemo');

	a(t(BusinessProcess), BusinessProcess);
	a(t(Extension), Extension);
	a.throws(function () { t(db.Object); }, Error);
	a.throws(function () { t(db.Object.extend('Foo')); }, Error);
};
