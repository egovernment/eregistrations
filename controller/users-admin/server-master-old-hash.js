'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , registerSubmit   = require('mano-auth/controller/server-master/register').submit
  , sendNotification = require('../../server/email-notifications/create-account');

var addUserSubmit = function (data) {
	return registerSubmit.apply(this, arguments)(function (result) {
		sendNotification(data).done(null, function (err) {
			console.log("Cannot send email", err, err.stack);
		});
		return result;
	});
};

// Add User
exports['user-add'] = {
	submit: function (normalizedData, data) {
		normalizedData['User#/password'] =
			oldClientHash(normalizedData['User#/email'], normalizedData['User#/password']);
		return addUserSubmit.apply(this, arguments);
	}
};
