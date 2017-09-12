'use strict';

var dbDriver = require('mano').dbDriver
  , userStorage = dbDriver.getStorage('user');

module.exports = function () {
	return {
		statusCode: 301,
		headers: {
			Location: '/account-confirmed'
		},
		controller: function (params) {
			if (!params || !params.token) return;
			return userStorage.searchOne({
				keyPath: 'createAccountToken',
				value: '3' + params.token
			}, function (id) {
				var targetId = id.slice(0, id.indexOf('/'));
				return userStorage.store(targetId + '/createAccountToken', '');
			});
		}
	};
};
