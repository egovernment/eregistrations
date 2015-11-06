'use strict';

var validDb = require('dbjs/valid-dbjs')
  , defineUser = require('./base');

module.exports = function (db/* options */) {
	var options, User;
	validDb(db);
	options = Object(arguments[1]);
	User = defineUser(db, options);
	require('./app-access-id')(db, options);
	require('./business-processes')(User, options);
	require('./documents')(User, options);
	require('./institution')(User, options);
	require('./demo')(User, options);
	require('./visited-business-processes')(db);
	require('./visited-users')(db);

	return User;
};
