'use strict';

var assign                 = require('es5-ext/object/assign')
  , oldClientHash          = require('mano-auth/utils/client-hash')
  , env                    = require('mano').env
  , externalAuthentication = (env && env.externalAuthentication) || {};

assign(exports, require('./server'),
	require('../demo-user/server')({ oldClientHash: oldClientHash }),
	require('../common/profile/server-old-hash'));

if (externalAuthentication.profilePage) {
	delete exports.profile;
}
