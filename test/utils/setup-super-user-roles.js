'use strict';

var db = require('mano').db
  , User = require('../../model/user/index')(require('mano').db);

module.exports = function (t, a) {
	var user = new User();
	db.Role.members.add('officialTest');

	a(user.roles.size, 0);
	t(user);
	a(user.roles.first, 'officialTest');
	a(user.roles.size === 1, true);
	user.roles.add('user');
	a(user.roles.size === 2, true);
	t(user, { onlyAdd: true });
	a(user.roles.has('officialTest'), true);
	a(user.roles.size === 2, true);
	t(user);
	a(user.roles.has('officialTest'), true);
	a(user.roles.size === 1, true);
};
