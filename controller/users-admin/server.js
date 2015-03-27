'use strict';

var assign         = require('es5-ext/object/assign')
  , router         = require('mano/server/post-router')
  , changePassword = require('mano-auth/controller/server/change-password').save
  , dbObjects      = require('mano').db.objects

  , save  = router.save;

// Common
assign(exports, require('../user/client'));

// Add User
exports['user-add'] = require('mano-auth/controller/server/register');

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	save: function (normalizedData, data) {
		if (this.propertyKey) return changePassword.apply(this, arguments);
		return save.apply(this, arguments);
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	save: function () { dbObjects.delete(this.target); }
};
