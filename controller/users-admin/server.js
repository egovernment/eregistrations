'use strict';

var assign         = require('es5-ext/object/assign')
  , promisify      = require('deferred').promisify
  , bcrypt         = require('bcrypt')
  , dbjsCreate     = require('mano/lib/utils/dbjs-form-create')
  , submit         = require('mano/utils/save')
  , changePassword = require('mano-auth/controller/server/change-password').submit
  , dbObjects      = require('mano').db.objects

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash);

// Common
assign(exports, require('../user/server'));

// Add User
exports['add-user'] = {
	submit: function (data) {
		// This POST request should be handled in main (not db process)
		throw new Error("Not applicable");
	}
};

// TODO: Remove after all apps use new split processes POST router
exports['user-add'] = {
	submit: function (data) {
		return hash(data['User#/password'], genSalt())(function (password) {
			data['User#/password'] = password;
			this.target = dbjsCreate(data);
		}.bind(this));
	}
};

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
