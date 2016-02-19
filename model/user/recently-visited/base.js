// Base model for LRU queue of visited entities

'use strict';

var memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineUser     = require('../base');

module.exports = memoize(function (db/* options */) {
	var options = arguments[1]
	  , User = ensureDatabase(db).User || defineUser(db, options);

	User.prototype.defineProperties({
		recentlyVisited: {
			type: db.Object,
			nested: true
		}
	});
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
