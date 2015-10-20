// Routes for the views.

'use strict';

var db = require('mano').db;

module.exports = {
	'/': require('../view/users-table'),
	'new-user': require('../view/user-create'),
	'user/[0-9][0-9a-z-]+': {
		match: function (userId) {
			this.editedUser = db.User.getById(userId);
			if (!this.editedUser) return false;
			return db.User.instances.filterByKey('email').has(this.editedUser);
		},
		view: require('../view/user-edit')
	},
	profile: require('../view/user-profile')
};
