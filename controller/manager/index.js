'use strict';

var assign   = require('es5-ext/object/assign')
  , mano     = require('mano')

  , db = mano.db;

var managedUserMatcher = function (managedUserId) {
	this.managedUser = db.User.getById(managedUserId);
	if (!this.user.isManagerActive) return false;
	return this.managedUser != null;
};

var businessProcessMatcher = function (businessProcessId) {
	var businessProcess = db.BusinessProcess.getById(businessProcessId);
	if (!businessProcess) return false;
	if (!managedUserMatcher.call(this, businessProcess.user.__id__)) return false;
	if (businessProcess.manager !== this.user) return false;
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
		this.user.currentlyManagedUser = this.managedUser;
	}
};

// The validation is currently handled in submit by destroyManagedUser
exports['clients/[0-9][a-z0-9]+/delete'] = {
	match: managedUserMatcher
};
