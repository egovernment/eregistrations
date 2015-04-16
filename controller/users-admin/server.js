'use strict';

var assign         = require('es5-ext/object/assign')
  , router         = require('mano/server/post-router')
  , changePassword = require('mano-auth/controller/server/change-password').submit
  , dbObjects      = require('mano').db.objects

  , submit  = router.submit;

// Common
assign(exports, require('../user/server'));

// Add User
exports['user-add'] = require('mano-auth/controller/server/register');

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	submit: function (normalizedData, data) {
		if (this.propertyKey) return changePassword.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	submit: function () { dbObjects.delete(this.target); }
};
