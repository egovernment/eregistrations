// Controller for both server and client.

'use strict';

var db                 = require('mano').db
  , assign             = require('es5-ext/object/assign')
  , dbjsValidate       = require('mano/lib/utils/dbjs-form-validate')
  , passwordValidation = require('mano-auth/utils/password-validation');

// Common controller.
module.exports = assign(exports, require('../user'));

exports['business-process/[0-9][a-z0-9]+/delete'] = {
	match: function (businessProcessId) {
		var businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return false;
		if (businessProcess.isSubmitted) return false;
		this.businessProcess = businessProcess;
		return true;
	},
	submit: function () {
		db.objects.delete(this.businessProcess);
	}
};

// Registration controller used by Demo users.
exports.register = {
	validate: function (data) {
		var user   = this.user
		  , userId = user.__id__;

		dbjsValidate(data, { partial: true });
		data[userId + '/password'] = passwordValidation(data[userId + '/password'],
			data['password-repeat']);

		return data;
	}
};
