'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , obj;
	t(db);
	obj = db.User.prototype;
	a(obj.leastRecentlyVisited.constructor, db.Object);
};
