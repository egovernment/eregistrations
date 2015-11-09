'use strict';

var defineUInteger = require('dbjs-ext/number/integer/u-integer')
  , memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineUser     = require('./base');

module.exports = memoize(function (db/* options */) {
	var options  = arguments[1]
	  , User     = ensureDatabase(db).User || defineUser(db, options)
	  , UInteger = defineUInteger(db);

	User.prototype.defineProperties({
		isDemo: {
			type: db.Boolean,
			value: false
		},
		// Last access microtime for demo users.
		demoLastAccessed: {
			type: UInteger,
			value: 0
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
