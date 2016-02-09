'use strict';

var assign           = require('es5-ext/object/assign')
  , registerSubmit   = require('mano-auth/controller/server-master/register')
  , sendNotification = require('../../server/email-notifications/create-account');

// Common
assign(exports, require('../user/server'));

// Add user
exports['user-add'] = {
	submit: function (data) {
		return registerSubmit.apply(this, arguments)(function (result) {
			sendNotification(data).done();
			return result;
		});
	}
};
