'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('../user/server'));

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	submit: function () {
		if (!this.user.roles.has('managerValidation') && !(this.user.roles.has('usersAdmin'))) {
			return;
		}
		return this.target.destroy();
	}
};
