'use strict';

var db         = require('mano').db
  , UInteger   = require('dbjs-ext/number/integer/u-integer')(db)
  , memoize    = require('memoizee/plain')
  , ensureType = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (User/* options */) {
	var db = ensureType(User).database;

	User.prototype.defineProperties({
		isDemo: {
			type: db.Boolean
		},
		// Last access microtime for demo users.
		demoLastAccessed: {
			type: UInteger
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
