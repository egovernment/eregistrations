'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('../user/server'));

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	validate: function (data) {
		this.target.validateDestroy();
		return data;
	},
	submit: function () {
		return this.target._destroy();
	}
};
