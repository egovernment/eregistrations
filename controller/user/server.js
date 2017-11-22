'use strict';

var submit                 = require('mano/utils/save')
  , env                    = require('mano').env
  , assign                 = require('es5-ext/object/assign')
  , changeOwnPassword      = require('mano-auth/controller/server/change-own-password').submit
  , externalAuthentication = (env && env.externalAuthentication) || {};

assign(exports, require('../common/managed-profile/server'),
	require('../common/request-create-account/server'));

if (!externalAuthentication.profilePage) {
	exports.profile = {
		submit: function (normalizedData, data) {
			if (data.password || data['password-new']) return changeOwnPassword.apply(this, arguments);
			return submit.apply(this, arguments);
		}
	};
}

// Active Business Process change
exports['change-business-process'] = {
	redirectUrl: '/'
};

exports['change-currently-managed-user'] = {
	redirectUrl: '/'
};
