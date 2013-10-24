'use strict';

var Db = require('dbjs'),
	memoize = require('memoizee/lib/primitive');

module.exports = memoize(function (roleName) {

	return require('mano').db.User.filter(function (user, set) {
		var item = user.roles.getItem('official');
		item.on('change', function (value) { set._update(user, value); });
		return item.value;
	});

	var officials =  Db.User.prototype._roles
		.indexFilter('official').filter(function (user) {
			return user.roles.getItem('official').roles.has(roleName);
		});

	require('mano').db.User.filter(function (user, set) {
		var item = user.roles.getItem('user');
		item.on('change', function (value) { set._update(user, value); });
		return item.value;
	});
});
