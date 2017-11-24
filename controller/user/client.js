'use strict';

var env    = require('mano').env
  , assign = require('es5-ext/object/assign')

  , externalAuthentication = (env && env.externalAuthentication) || {};

assign(exports, require('../common/managed-profile/client'),
	require('../common/request-create-account/client'), require('../common/profile/client'));

if (externalAuthentication.profilePage) {
	delete exports.profile;
}
