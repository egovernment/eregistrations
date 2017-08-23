'use strict';

module.exports = function () {
	return {
		register: {
			remoteSubmit: true
		},
		login: require('mano-auth/controller/client/login')
	};
};
