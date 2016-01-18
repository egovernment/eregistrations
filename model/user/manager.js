// User manager (notary) related properties

'use strict';

var memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineUser     = require('./base');

module.exports = memoize(function (db/* options */) {
	var options  = arguments[1]
	  , User     = ensureDatabase(db).User || defineUser(db, options);

	User.prototype.defineProperties({
		// Whether account is user manager account
		isManager: {
			type: db.Boolean,
			value: false
		},
		// Clients (users) of user manager
		clients: {
			type: User,
			multiple: true
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
