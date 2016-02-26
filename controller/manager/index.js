'use strict';

var assign   = require('es5-ext/object/assign')
  , validate = require('mano/utils/validate')
  , mano     = require('mano')

  , db = mano.db;

var clientMatcher = function (clientId) {
	this.client = db.User.getById(clientId);
	if (!this.client) return false;
	return this.client.manager === this.user;
};

var businessProcessMatcher = function (businessProcessId) {
	var businessProcess = db.BusinessProcess.getById(businessProcessId);
	if (!businessProcess) return false;
	if (businessProcess.isSubmitted) return false;
	if (!clientMatcher.call(this, businessProcess.user.__id__)) return false;
	this.businessProcess = businessProcess;
	return true;
};

// Common
assign(exports, require('../user'));

// Add User
exports['user-add'] = {
	validate: validate,
	redirectUrl: '/'
};

exports['business-process/[0-9][a-z0-9]+/delete'] = {
	match: businessProcessMatcher,
	submit: function () {
		db.objects.delete(this.businessProcess);
	}
};

exports['business-process/[0-9][a-z0-9]+'] = {
	match: businessProcessMatcher,
	submit: function () {
		this.user.currentlyManagedUser   = this.client;
		this.user.currentBusinessProcess = this.businessProcess;
	}
};

exports['clients/[0-9][a-z0-9]+'] = {
	match: clientMatcher,
	submit: function () {
		this.user.currentlyManagedUser = this.client;
	}
};

exports['clients/[0-9][a-z0-9]+/delete'] = {
	match: function (clientId) {
		if (!clientMatcher.call(this, clientId)) return false;
		return this.client.initialBusinessProcesses.filterByKey('isSubmitted', true).size === 0;
	}
};
