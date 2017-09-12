'use strict';

module.exports = function () {
	return {
		register: {
			remoteSubmit: true,
			processResponse: function () {
				location.href = '/logout/?redirect=/request-confirm-account/';
			}
		},
		login: require('mano-auth/controller/client/login')
	};
};
