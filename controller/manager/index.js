'use strict';

var assign   = require('es5-ext/object/assign')
  , validate = require('mano/utils/validate')
  , mano     = require('mano')

  , db = mano.db;

// Common
assign(exports, require('../user'));

// Add User
exports['user-add'] = {
	validate: validate,
	redirectUrl: '/'
};

exports['clients/[0-9][a-z0-9]+/delete'] = {
	match: function (clientId) {
		this.client = db.User.getById(clientId);
		if (!this.client) return false;
		if (this.client.manager !== this.user) return false;
		return this.client.initialBusinessProcesses.filterByKey('isSubmitted', true).size === 0;
	},
	submit: function () {
		this.client.initialBusinessProcesses.forEach(function (bp) {
			db.objects.delete(bp);
		});
		db.objects.delete(this.client);
	}
};
