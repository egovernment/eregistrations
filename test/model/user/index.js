'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , User = t(db)

	  , user = new User();

	a(db.Person.is(user), true);
};
