'use strict';

var registerSubmit   = require('mano-auth/controller/server-master/register')
  , sendNotification = require('../../server/email-notifications/create-account');

// Add user
exports['user-add'] = {
	submit: function (data) {
		return registerSubmit.apply(this, arguments)(function (result) {
			sendNotification(data).done();
			return result;
		});
	}
};
