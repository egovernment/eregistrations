'use strict';

var assign         = require('es5-ext/object/assign')
  , promisify      = require('deferred').promisify
  , bcrypt         = require('bcrypt')
  , dbjsCreate     = require('mano/lib/utils/dbjs-form-create')
  , router         = require('mano/server/post-router')
  , changePassword = require('mano-auth/controller/server/change-password').submit
  , dbObjects      = require('mano').db.objects

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash)
  , submit  = router.submit;

// Common
assign(exports, require('../user/server'));

// Add User
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
