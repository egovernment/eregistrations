'use strict';

var db = require('../db');

module.exports = function (user) {
	db.Role.members.forEach(function (role) {
		if (!db.Role.isPartARole(role) && !user.roles.has(role)) {
			user.roles.add(role);
		}
	});
	db.Role.members.forEach(function (role) {
		if (db.Role.isPartARole(role) && user.roles.has(role)) {
			user.roles.delete(role);
		}
	});
};
