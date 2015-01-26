'use strict';

var validDb = require('dbjs/valid-dbjs');

module.exports = function (db) {
	validDb(db);
	require('./registrations')(db);
	require('./costs')(db);
	require('./requirements')(db);
	require('./certificates')(db);

	return db.User;
};
