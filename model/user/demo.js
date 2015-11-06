'use strict';

var defineUInteger = require('dbjs-ext/number/integer/u-integer')
  , memoize        = require('memoizee/plain')
  , ensureType     = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (User/* options */) {
	var db       = ensureType(User).database
	  , UInteger = defineUInteger(db);

	return User.prototype.defineProperties({
		isDemo: {
			type: db.Boolean
		},
		// Last access microtime for demo users.
		demoLastAccessed: {
			type: UInteger
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
