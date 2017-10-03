'use strict';

var env = require('mano').env
  , isAccountConfirmationDisabled = env && env.isAccountConfirmationDisabled;

module.exports = function () {
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
