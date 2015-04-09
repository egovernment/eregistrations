'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , loginSave     = require('./server').login.save
  , registerSave  = require('./server').register.save
  , resetSave     = require('./server')['reset-password'].save;

module.exports = exports = require('./server');

exports.login.save = function (normalizedData, data) {
	normalizedData.password = oldClientHash(normalizedData.email, normalizedData.password);
	return loginSave.apply(this, arguments);
};
exports.register.save = function (normalizedData, data) {
	normalizedData['User#/password'] =
		oldClientHash(normalizedData['User#/email'], normalizedData['User#/password']);
	return registerSave.apply(this, arguments);
};
exports['reset-password'].save = function (normalizedData, data) {
	normalizedData.password = oldClientHash(normalizedData.email,
		normalizedData.password);
	return resetSave.apply(this, arguments);
};
