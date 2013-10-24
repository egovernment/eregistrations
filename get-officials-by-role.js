'use strict';

var memoize = require('memoizee/lib/primitive'),
	officials = require('./officials');

module.exports = memoize(function (roleName) {
	return officials.filter(function (user, set) {
		var item = user.roles.getItem('official').roles.getItem(roleName);
		item.on('change', function (value) { set._update(user, value); });
		return item.value;
	});
});
