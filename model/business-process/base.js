"use strict";

var memoize    = require('memoizee/plain')
  , defineUser = require('mano-auth/model/user')
  , validDb    = require('dbjs/valid-dbjs');

module.exports = memoize(function (db/*, options*/) {
	var User;
	validDb(db);
	User = defineUser(db, arguments[1]);

	return db.Object.extend('BusinessProcess', {
		user: { type: User }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
