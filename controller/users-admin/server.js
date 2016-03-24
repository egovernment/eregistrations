'use strict';

var assign           = require('es5-ext/object/assign')
  , submit           = require('mano/utils/save')
  , changePassword   = require('mano-auth/controller/server/change-password').submit
  , dbObjects        = require('mano').db.objects
  , sendNotification = require('../../server/email-notifications/create-account')
  , deferred         = require('deferred')
  , bcrypt           = require('bcrypt')
  , queryMaster      = require('eregistrations/server/services/query-master/slave')

  , promisify = deferred.promisify
  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash);

// Common
assign(exports, require('../user/server'));

// Add user
exports['user-add'] = {
	submit: function (data, normalizedData) {
		var email = normalizedData['User#/email'], args = arguments;

		return queryMaster('ensureEmailNotTaken', {
			email: email
		}).then(function () {
			return hash(email, genSalt()).then(function (password) {
				normalizedData['User#/password'] = password;
				return submit.apply(this, args).then(function (result) {
					console.log('result OF SAVE', result);
					return result;
				});
			}.bind(this));
		});
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
