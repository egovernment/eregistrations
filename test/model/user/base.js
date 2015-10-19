'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , User = t(db)

	  , user = new User();

	user.firstName = "Kamil";
	user.lastName = "Gruca";

	a(user.fullName, "Kamil Gruca");
	a(db.Person.is(user), true);
};
