'use strict';

var env = require('mano').env
, isAccountConfirmationDisabled = env && env.isAccountConfirmationDisabled
, reloadAfterSync = require('mano-auth/controller/lib/reload-after-sync');

exports.login = require('mano-auth/controller/client/login');
exports.register = {
	remoteSubmit: require('mano/client/utils/remote-submit-locked'),
	processResponse: function (data) {
		if (isAccountConfirmationDisabled) return reloadAfterSync(data);
		location.href = '/request-confirm-account';
	}
};
exports['reset-password'] = require('mano-auth/controller/client/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/client/request-reset-password');
exports['create-managed-account'] = {
	remoteSubmit: require('mano/client/utils/remote-submit-locked'),
	processResponse: reloadAfterSync
};
