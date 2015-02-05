'use strict';

var memoize            = require('memoizee/plain')
  , validDb            = require('dbjs/valid-dbjs')
  , defineUser         = require('mano-auth/model/user');

module.exports = memoize(function (db) {
	var User;
	validDb(db);
	User = defineUser(db);
	User.prototype.defineProperties({
		requirements: {
			type: db.Object,
			nested: true
		}
	});

	return db.User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
