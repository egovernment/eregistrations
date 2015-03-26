'use strict';

var validDb = require('dbjs/valid-dbjs')
  , defineUser = require('mano-auth/model/user');

module.exports = function (db/* options */) {
	var options, User;
	validDb(db);
	options = Object(arguments[1]);
	User = defineUser(db, options);
	require('./business-processes')(User, options);
	require('./documents')(User, options);

	return User;
};
