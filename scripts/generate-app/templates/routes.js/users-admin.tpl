// Routes for the views.

'use strict';

var db = require('mano').db;

require('../../apps-common/searchable-user-property-names');
require('../../view/user-base');

module.exports = {
	'/': require('eregistrations/view/users-table'),
	'new-user': require('eregistrations/view/user-create'),
	'user/[0-9][0-9a-z-]+': {
		match: function (userId) {
			this.editedUser = db.User.getById(userId);
			if (!this.editedUser) return false;
			return db.User.instances.filterByKey('email').has(this.editedUser);
		},
		view: require('eregistrations/view/user-edit')
	},
	profile: require('eregistrations/view/user-profile')
};
