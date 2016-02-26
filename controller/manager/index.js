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

// Common
assign(exports, require('../user'));

// Add User
exports['user-add'] = {
	validate: validate,
	redirectUrl: '/'
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
