'use strict';

var assign              = require('es5-ext/object/assign')
  , submit              = require('mano/utils/save')
  , changePassword      = require('mano-auth/controller/server/change-password').submit
  , hash                = require('mano-auth/hash')
  , sendNotification    = require('../../server/email-notifications/create-account')
  , queryMaster         = require('eregistrations/server/services/query-master/slave')
  , setupSuperUserRoles = require('../../utils/setup-super-user-roles')
  , genId               = require('time-uuid')
  , env                 = require('mano').env
  , isAccountConfirmationDisabled = env && env.isAccountConfirmationDisabled;

// Common
assign(exports, require('../user/server'));

// Add user
exports['user-add'] = {
	submit: function (data) {
		var email = data['User#/email'], args = arguments;

		return queryMaster('ensureEmailNotTaken', {
			email: email
		}).then(function () {
			return hash.hash(data['User#/password']).then(function (password) {
				data['User#/password'] = password;
				if (!isAccountConfirmationDisabled) {
					data['User#/createAccountToken'] = genId();
				}

				submit.apply(this, args);
				if (data['User#/isSuperUser']) {
					setupSuperUserRoles(this.target);
				}
				sendNotification(this.target).done(null, function (err) {
					console.log(err.stack);
					console.error("Cannot send email");
				});
				return true;
			}.bind(this));
		}.bind(this));
	}
};

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	submit: function (normalizedData, data) {
		var currentEmail = this.target.email, email = data[this.target.__id__ + '/email']
		  , save, args = arguments;

		save = function () {
			if (this.propertyKey) return changePassword.apply(this, args);
			return submit.apply(this, args);
		}.bind(this);

		if (email && (currentEmail !== email)) {
			return queryMaster('ensureEmailNotTaken', {
				email: email
			}).then(save);
		}
		return save();
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	validate: function (data) {
		this.target.validateDestroy();

		return data;
	},
	submit: function () {
		this.target._destroy();
		return true;
	}
};
