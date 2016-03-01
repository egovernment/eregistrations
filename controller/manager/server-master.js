'use strict';

var userEmailMap   = require('mano/lib/server/user-email-map')
  , resolveRecords = require('mano/lib/server/resolve-records-from-form-data')
  , mano           = require('mano')
  , dbDriver = mano.dbDriver
  , userStorage = dbDriver.getStorage('user');

// Add user
exports['user-add'] = {
	submit: function (data) {
		return userEmailMap.ensureUniq(data['User#/email']).then(function (value) {
			var result = resolveRecords(data, 'User#');
			this.targetId = result.id;
			result.records.push({ id: this.targetId + '/manager',
				data: { value: '7' + this.req.$user } });
			return userStorage.storeMany(result.records)(true);
		}.bind(this));
	}
};
