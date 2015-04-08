'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , loginSave     = require('./server').login.save
  , registerSave  = require('./server').register.save
  , resetSave     = require('./server')['reset-password'].save;

module.exports = exports = require('./server');

exports.login.save = function (data) {
	data.password = oldClientHash(data.email, data.password);
	return loginSave.call(this, data);
};
exports.register.save = function (data) {
	data['User#/password'] = oldClientHash(data['User#/email'], data['User#/password']);
	return registerSave.call(this, data);
};
exports['reset-password'].save = function (data) {
	data.password = oldClientHash(data.email, data.password);
	return resetSave.call(this, data);
};
