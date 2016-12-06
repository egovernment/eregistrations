'use strict';

var assign              = require('es5-ext/object/assign')
  , router              = require('mano/client/post-router')
  , setupSuperUserRoles = require('../../utils/setup-super-user-roles')

  , submit  = router.submit, remoteSubmit = router.remoteSubmit;

// Common
assign(exports, require('../user/client'));

// Add User
exports['user-add'] = { remoteSubmit: true };

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	submit: function (normalizedData, data) {
		if (data[this.target.__id__ + '/isSuperUser'] === "1") {
			setupSuperUserRoles(this.target);
		}
		if (this.propertyKey) return remoteSubmit.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	remoteSubmit: true,
	processResponse: function () {
		this.target._setValue_();
	}
};
