'use strict';

var getCookie = require('dom-ext/html-document/#/get-cookie')
  , setCookie = require('dom-ext/html-document/#/set-cookie');

module.exports = function () {
	var userId = getCookie.call(document, 'authenticated' + location.port)
	  , wasRefreshed;

	if (userId) {
		localStorage._authenticated = userId;
		return userId;
	}
	wasRefreshed = getCookie.call(document, 'authRefreshCheck');
	if (!wasRefreshed) {
		setCookie.call(document, 'authRefreshCheck', '1', { age: 60 });
		location.reload();
		return;
	}
	throw new Error('No data on authenticated user found. ' +
		'Make sure that url port matches one provided into url setting in env.js(on)');
};
