// Collection of all users (registered accounts with 'user' role)

'use strict';

module.exports = require('mano').db.User.filter(function (user, set) {
	var item = user.roles.getItem('user');
	item.on('change', function (value) { set._update(user, value); });
	return item.value;
});
