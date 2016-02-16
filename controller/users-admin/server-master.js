'use strict';

var registerSubmit   = require('mano-auth/controller/server-master/register').submit
  , sendNotification = require('../../server/email-notifications/create-account');

// Add user
exports['user-add'] = {
	submit: function (data) {
		return registerSubmit.apply(this, arguments)(function (result) {
			sendNotification(data).done(null, function (err) {
				console.log("Cannot send email", err.stack);
			});
			return result;
		});
	}
};
