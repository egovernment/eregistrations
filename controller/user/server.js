'use strict';

var submit            = require('mano/utils/save')
  , changeOwnPassword = require('mano-auth/controller/server/change-own-password').submit
  , requestCreateManagedAccount = require('../utils/request-create-managed-account');

exports.profile = {
	submit: function (normalizedData, data) {
		if (data.password || data['password-new']) return changeOwnPassword.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};

exports['request-create-managed-account/[0-9][a-z0-9]+'] = {
	submit: requestCreateManagedAccount
};

// Active Business Process change
exports['change-business-process'] = {
	redirectUrl: '/'
};

exports['change-currently-managed-user'] = {
	redirectUrl: '/'
};
