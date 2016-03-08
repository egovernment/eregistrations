'use strict';

var userEmailMap   = require('mano/lib/server/user-email-map')
  , resolveRecords = require('mano/lib/server/resolve-records-from-form-data')
  , mano           = require('mano')
  , dbDriver       = mano.dbDriver
  , userStorage    = dbDriver.getStorage('user')
  , genId    = require('time-uuid')
  , _ = mano.i18n.bind("Authentication")
  , unserializeObjectRecord = require('../../server/utils/unserialize-object-record')
  , serializeValue   = require('dbjs/_setup/serialize/value')
  , requestCreateManagedAccountMail =
		require('../../server/email-notifications/request-create-managed-account');

var sendCreateRequest = function (data) {
	requestCreateManagedAccountMail(data).done(null, function (err) {
		console.log(err.stack);
		console.error("Cannot send email");
	});
	return { message: _("The account creation request has been sent.") };
};

exports['request-create-manager-account/[0-9][a-z0-9]+'] = {
	match: function (userId) {
		return userStorage.get(userId)(function (data) {
			this.targetId = userId;
			return data && data.value === '7User#';
		}.bind(this));
	},
	validate: function (data) {
		return userEmailMap().then(function (resultMap) {
			var result = resolveRecords(data, this.targetId);
			if (resultMap.has(serializeValue(data[this.targetId + '/email']))) {
				this.sendOnly = true;
			}
			return result.records;
		}.bind(this));
	},
	submit: function (recordsRaw) {
		var data, saveData;
		data       = unserializeObjectRecord(recordsRaw);
		data.token = genId();
		saveData = [{ id: this.targetId + '/createManagedAccountToken',
			data: { value: serializeValue(data.token) } }];

		if (!this.sendOnly) {
			saveData.push({ id: this.targetId + '/email', data: { value: serializeValue(data.email) } });
			saveData.push({ id: this.targetId + '/isInvitationSent',
				data: { value: serializeValue(true) } });
		}
		return userStorage.storeMany(saveData).then(function () {
			return sendCreateRequest(data);
		});

	}
};
