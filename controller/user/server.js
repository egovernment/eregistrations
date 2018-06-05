'use strict';

var env                    = require('mano').env
  , assign                 = require('es5-ext/object/assign')
  , externalAuthentication = (env && env.externalAuthentication) || {};

assign(exports, require('../common/managed-profile/server'),
	require('../common/request-create-account/server'), require('../common/profile/server'));

if (externalAuthentication.profilePage) {
	delete exports.profile;
	delete exports['managed-profile'];
}

// Active Business Process change
exports['change-business-process'] = {
	redirectUrl: '/'
};

exports['change-currently-managed-user'] = {
	redirectUrl: '/'
};
