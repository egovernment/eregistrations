'use strict';

var assign         = require('es5-ext/object/assign')
  , submit         = require('mano/utils/save')
  , changePassword = require('mano-auth/controller/server/change-password').submit
  , dbObjects      = require('mano').db.objects;

// Common
assign(exports, require('../user/server'));

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
