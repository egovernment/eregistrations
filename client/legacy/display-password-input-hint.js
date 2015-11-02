'use strict';

var $ = require('mano-legacy');

module.exports = $.displayPasswordInputHint = function (passwordInput, formatMessage) {
	// Clear any existing message first.
	passwordInput.setCustomValidity('');

	if (!passwordInput.validity.valid) {
		if (passwordInput.validity.patternMismatch) {
			passwordInput.setCustomValidity(formatMessage);
		}
	}
};
