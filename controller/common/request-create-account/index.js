// Controller for both server and client.

'use strict';

var matchUser = require('../../utils/user-matcher');

exports['request-create-account/[0-9][a-z0-9]+'] = {
	match: matchUser,
	redirectUrl: '/'
};
