'use strict';

var env                                = require('mano').env
  , isAccountConfirmationDisabled      = env && env.isAccountConfirmationDisabled
  , useExternalAuthenticationAuthority = env && env.useExternalAuthenticationAuthority;

module.exports = function () {
	if (useExternalAuthenticationAuthority) return {};

	return {
		register: {
			remoteSubmit: true,
			processResponse: function () {
				if (isAccountConfirmationDisabled) return;
				location.href = '/logout/?redirect=/request-confirm-account/';
			}
		},
		login: require('mano-auth/controller/client/login')
	};
};
