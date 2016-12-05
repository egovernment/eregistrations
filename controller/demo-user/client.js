'use strict';

module.exports = function () {
	return {
		register: require('mano-auth/controller/client/register-and-login'),
		login: require('mano-auth/controller/client/login')
	};
};
