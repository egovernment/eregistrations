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

		return userStorage.getComputed(userId + '/isManagerActive')(function (data) {
			if (!data || (!unserializeValue(data.value))) {
				throw customError("Cannot process request", "INVALID_REQUEST", { statusCode: 400 });
			}
			return validate.apply(this, args);
		}.bind(this));
	},
	submit: function (data) {
		var save;
		data['User#/roles'] = ['user'];

		save = function () {
			var result = resolveRecords(data, 'User#');
			this.targetId = result.id;
			result.records.push({ id: this.targetId + '/manager',
				data: { value: '7' + this.req.$user }
				});
			result.records.push({ id: this.req.$user + '/currentlyManagedUser',
				data: { value: '7' + this.targetId }
				});
			return userStorage.storeMany(result.records)(true);
		}.bind(this);

		if (data['User#/email']) {
			return userEmailMap.ensureUniq(data['User#/email']).then(save);
		}
		return save();
	}
};
