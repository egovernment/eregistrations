'use strict';

var changeOwnPassword = require('mano-auth/controller/change-own-password').validate
  , db                = require('mano').db
  , validate          = require('mano/utils/validate');

var managedUserMatcher = function (managedUserId) {
	this.managedUser = db.User.getById(managedUserId);
	if (!this.managedUser) return false;
	return this.managedUser.manager === this.manager;
};

// Profile
exports.profile = {
	validate: function (data) {
		if (data.password || data['password-new']) return changeOwnPassword.call(this, data);
		delete data.password;
		delete data['password-new'];
		delete data['password-repeat'];
		return validate.call(this, data, { partial: true });
	}
};

exports['request-create-managed-account/[0-9][a-z0-9]+'] = {
	match: function (managedUserId) {
		if (!this.manager) return false;
		if (!managedUserMatcher.call(this, managedUserId)) return false;
		return !this.managedUser.roles.has('user');
	}
};

// Role switch
exports['set-role'] = true;

// Active Business Process change
exports['change-business-process'] = true;

// Active Managed User change
exports['change-currently-managed-user'] = true;
