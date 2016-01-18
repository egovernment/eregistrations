'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db   = new Database()
	  , User = t(db)

	  , user;

	user = new User();

	a(user.isManager, false);
	a.deep(aFrom(user.clients), []);

	user.isManger = true;
	user.clients.add(User.newNamed('johnSmith'));
	a.deep(aFrom(user.clients), [db.johnSmith]);
};
