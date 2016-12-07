'use strict';

var db = require('../db');

module.exports = function (user/*, opts */) {
	var opts = Object(arguments[1]);
	db.Role.members.forEach(function (role) {
		if (!db.Role.isPartARole(role) && !user.roles.has(role)) {
			user.roles.add(role);
		}
	});
	if (!opts.onlyAdd) {
		db.Role.members.forEach(function (role) {
			if (db.Role.isPartARole(role) && user.roles.has(role)) {
				user.roles.delete(role);
			}
		});
	}
};
