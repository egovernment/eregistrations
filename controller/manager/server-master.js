'use strict';

var userEmailMap   = require('mano/lib/server/user-email-map')
  , resolveRecords = require('mano/lib/server/resolve-records-from-form-data')
  , mano           = require('mano')
  , validate       = require('mano/utils/validate')
  , dbDriver       = mano.dbDriver
  , customError    = require('es5-ext/error/custom')
  , userStorage    = dbDriver.getStorage('user')
  , unserializeValue = require('dbjs/_setup/unserialize/value');

// Add user
exports['user-add'] = {
	validate: function () {
		var userId = this.req.$user, args = arguments;
		return userStorage.get(userId + '/isManagerActive')(function (data) {
			return data && (unserializeValue(data.value) === true);
		}).then(function (res) {
			if (!res) {
				throw customError("Cannot process request", "INVALID_REQUEST", { statusCode: 400 });
			}
			return validate.apply(this, args);
		}.bind(this));
	},
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
