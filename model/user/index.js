'use strict';

var validDb = require('dbjs/valid-dbjs')
  , defineUser = require('./base');

module.exports = function (db/* options */) {
	var options, User;
	validDb(db);
	options = Object(arguments[1]);
	User = defineUser(db, options);
	require('./app-resolvers')(db, options);
	require('./business-processes')(User, options);
	require('./demo')(db);
	require('./documents')(User, options);
	require('./institution')(User, options);
	require('./least-recently-visited/business-processes')(db);
	require('./least-recently-visited/users')(db);

	return User;
};
