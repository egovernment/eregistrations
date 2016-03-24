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
	submit: function (data) {
		var email = data['User#/email'], args = arguments;

		return queryMaster('ensureEmailNotTaken', {
			email: email
		}).then(function () {
			return hash(email, genSalt()).then(function (password) {
				data['User#/password'] = password;

				submit.apply(this, args);
				sendNotification(this.target).done();
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

		if (!currentEmail || (currentEmail !== email)) {
			return queryMaster('ensureEmailNotTaken', {
				email: email
			}).then(save);
		}
		return save();
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	submit: function () { dbObjects.delete(this.target); }
};
