'use strict';

var db = require('../../db');

module.exports = function (user) {
	user.roles.clear();
	db.Role.members.forEach(function (role) {
		if (!db.Role.isPartARole(role) || db.Role.isOfficialRole(role)) {
			user.roles.add(role);
		}
	});
};
