'use strict';

var userEmailMap   = require('mano/lib/server/user-email-map')
  , resolveRecords = require('mano/lib/server/resolve-records-from-form-data')
  , mano           = require('mano')
  , dbDriver = mano.dbDriver
  , userStorage = dbDriver.getStorage('user');

module.exports = function (data) {
	return userEmailMap.ensureUniq(data['User#/email']).then(function (value) {
		var result = resolveRecords(data, 'User#');
		this.targetId = result.id;
		return userStorage.storeMany(result.records)(true);
	}.bind(this));
};
