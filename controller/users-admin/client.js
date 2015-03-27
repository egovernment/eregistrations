'use strict';

var assign = require('es5-ext/object/assign')
  , router = require('mano/client/post-router')

  , save  = router.save, remoteSave = router.remoteSave;

// Common
assign(exports, require('../user/client'));

// Add User
exports['user-add'] = require('mano-auth/controller/client/register');

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	save: function (normalizedData, data) {
		if (this.propertyKey) return remoteSave.apply(this, arguments);
		return save.apply(this, arguments);
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = { remoteSave: true };
