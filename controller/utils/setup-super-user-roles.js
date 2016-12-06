'use strict';

var db = require('../../db');

var isSuperUserRole = function (role) {
	return !db.Role.isPartARole(role) || db.Role.isOfficialRole(role);
};

module.exports = function (user) {
	db.Role.members.forEach(function (role) {
		if (isSuperUserRole(role) && !user.roles.has(role)) {
			user.roles.add(role);
		}
	});
	db.Role.members.forEach(function (role) {
		if (!isSuperUserRole(role) && user.roles.has(role)) {
			user.roles.delete(role);
		}
	});
};
