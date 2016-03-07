'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('../user/client'));

// Add User
exports['user-add'] = {
	remoteSubmit: true
};

// Delete User
exports['clients/[0-9][a-z0-9]+/delete'] = {
	remoteSubmit: true,
	processResponse: function () {
		this.managedUser._setValue_();
	}
};

// Delete BusinessProcess
exports['business-process/[0-9][a-z0-9]+/delete'] = {
	remoteSubmit: true,
	processResponse: function () {
		this.businessProcess._setValue_();
	}
};
