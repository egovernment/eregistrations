// Controller for both server and client.

'use strict';

var matchUser = require('../../utils/user-matcher')
  , env = require('mano').env
  , externalAuthentication = (env && env.externalAuthentication);

exports['request-create-account/[0-9][a-z0-9]+'] = {
	match: externalAuthentication ? function () {
		return false; // disabled
	} : matchUser,
	redirectUrl: '/'
};
