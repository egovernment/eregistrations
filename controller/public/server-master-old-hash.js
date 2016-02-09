'use strict';

var oldClientHash  = require('mano-auth/utils/client-hash')
  , loginSubmit    = require('./server-master').login.submit
  , registerSubmit = require('./server-master').register.submit
  , resetSubmit    = require('./server-master')['reset-password'].submit;

module.exports = exports = require('./server-master');

exports.login.submit = function (normalizedData, data) {
	normalizedData.password = oldClientHash(normalizedData.email, normalizedData.password);
	return loginSubmit.apply(this, arguments);
};
exports.register.submit = function (normalizedData, data) {
	normalizedData['User#/password'] =
		oldClientHash(normalizedData['User#/email'], normalizedData['User#/password']);
	return registerSubmit.apply(this, arguments);
};
exports['reset-password'].submit = function (normalizedData, data) {
	normalizedData.password = oldClientHash(normalizedData.email,
		normalizedData.password);
	return resetSubmit.apply(this, arguments);
};
