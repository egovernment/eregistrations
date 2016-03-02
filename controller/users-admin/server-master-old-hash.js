'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , addUserSubmit = require('./server-master')['user-add'].submit;

// Common
module.exports = exports = require('./server-master');

// Add User
exports['user-add'].submit = function (normalizedData, data) {
	normalizedData['User#/password'] =
		oldClientHash(normalizedData['User#/email'], normalizedData['User#/password']);
	return addUserSubmit.apply(this, arguments);
};
