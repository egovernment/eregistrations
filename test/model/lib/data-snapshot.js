'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database();
	t(db);
	a(db.DataSnapshot.__id__, 'DataSnapshot');
};
