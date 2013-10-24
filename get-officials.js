'use strict';

var Db = require('dbjs'),
	memoize = require('memoizee/lib/primitive');

module.exports = memoize(function (roleName) {
	return Db.User.prototype._roles
		.indexFilter('official').filter(function (user) {
			return user.roles.getItem('official').roles.has(roleName);
		});
});
