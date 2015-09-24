// Base model for LRU queue of visited business processes
// It serves the server access rules, on basis of that list full
// data of business processes is propagated to user in real time

'use strict';

var memoize               = require('memoizee/plain')
  , ensureDatabase        = require('dbjs/valid-dbjs')
  , defineUser            = require('./base');

module.exports = memoize(function (db/* options */) {
	var options = arguments[1]
	  , User = ensureDatabase(db).User || defineUser(db, options);

	User.prototype.defineProperties({
		visitedUsers: {
			type: db.User,
			multiple: true
		}
	});
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
