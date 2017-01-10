'use strict';

var assign   = require('es5-ext/object/assign')
  , mano     = require('mano')
  , camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , createBusinessProcess = require('../utils/create-business-process')
  , validateCreateProcess = require('../utils/validate-create-business-process')

  , db = mano.db;

var managedUserMatcher = function (managedUserId) {
	if (!this.authenticatedUser.isManagerActive) return false;
	this.managedUser = db.User.getById(managedUserId);
	return this.managedUser != null;
};

var businessProcessMatcher = function (businessProcessId) {
	var businessProcess = db.BusinessProcess.getById(businessProcessId);
	if (!businessProcess) return false;
	if (!managedUserMatcher.call(this, businessProcess.user.__id__)) return false;
	if (businessProcess.manager !== this.authenticatedUser) return false;
	this.businessProcess = businessProcess;
	return true;
};

// Common
assign(exports, require('../user'));

// Add User
exports['user-add'] = {
	redirectUrl: '/'
};

exports['business-process/[0-9][a-z0-9]+/delete'] = {
	match: function (businessProcessId) {
		if (!businessProcessMatcher.call(this, businessProcessId)) return false;
		return !this.businessProcess.isSubmitted;
	}
};

exports['business-process/[0-9][a-z0-9]+'] = {
	match: businessProcessMatcher,
	submit: function () {
		this.user.currentlyManagedUser   = this.managedUser;
		this.user.currentBusinessProcess = this.businessProcess;
	}
};

exports['clients/[0-9][a-z0-9]+'] = {
	match: managedUserMatcher,
	submit: function () {
		this.authenticatedUser.currentlyManagedUser = this.managedUser;
	}
};

// The validation is currently handled in submit by user destruction mechanism
exports['clients/[0-9][a-z0-9]+/delete'] = {
	match: managedUserMatcher
};

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	exports['start-new-business-process/' + camelToHyphen.call(BusinessProcess.__id__)] = {
		submit: function () {
			createBusinessProcess(BusinessProcess).call(this);
			this.manager.currentlyManagedUser = this.managedUser;
		},
		redirectUrl: '/',
		validate: function (normalizedData, data) {
			if (!this.authenticatedUser.isManagerActive) return false;
			if (!normalizedData.client) return false;
			this.managedUser = db.User.getById(normalizedData.client);
			if (!this.managedUser) return false;
			this.manager = this.authenticatedUser;
			this.user = this.managedUser;
			return validateCreateProcess(BusinessProcess).call(this);
		}
	};
});
