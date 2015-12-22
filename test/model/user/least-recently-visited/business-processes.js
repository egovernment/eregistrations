'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , obj;
	t(db);
	obj = db.User.prototype.leastRecentlyVisited.businessProcesses;
	obj.define('test', { multiple: true });
	a(obj.getDescriptor('test').type, db.BusinessProcessBase);
};
