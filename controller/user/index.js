'use strict';

var env                    = require('mano').env
  , assign                 = require('es5-ext/object/assign')
  , externalAuthentication = (env && env.externalAuthentication) || {};

assign(exports, require('../common/managed-profile'),
	require('../common/request-create-account'), require('../common/profile/index'));

// Profile
if (externalAuthentication.profilePage) {
	delete exports.profile;
}

// Role switch
exports['set-role'] = true;

// Institution switch
exports['set-institution'] = true;

// Zone switch
exports['set-zone'] = true;

// Active Business Process change
exports['change-business-process'] = true;

// Active Managed User change
exports['change-currently-managed-user'] = true;
