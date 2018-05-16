'use strict';

var driver = require('mano').dbDriver
  , deferred = require('deferred')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , userStorage = driver.getStorage('user');

var setupProperty = function (user, prop, value) {
	user[prop] = value;
};

var getUserEmail = function (uid) {
	return userStorage.get(uid + '/email').then(function (data) {
		if (!data || !unserializeValue(data.value)) return;
		return unserializeValue(data.value);
	});
};

var props = ['firstName', 'lastName'];

module.exports = function (bpId) {
	var user = null;
	return userStorage.search({
		keyPath: 'initialBusinessProcesses',
		value: '7' + bpId
	}, function (id) {
		user = { id: id.split('/')[0] };
	}).then(function () {
		if (!user) return;
		return userStorage.get(user.id + '/password').then(function (data) {
			if (!data) return false;
			return Boolean(unserializeValue(data.value));
		}).then(function (isActiveAccount) {
			if (!isActiveAccount) {
				return userStorage.get(user.id + '/manager').then(function (data) {
					if (!data || (data.value[0] !== '7')) {
						return;
					}
					return data.value.slice(1);
				}).then(function (managerId) {
					if (!managerId) return;
					return userStorage.getComputed(managerId + '/isManagerActive').then(function (data) {
						if (!data || !unserializeValue(data.value)) return;
						return getUserEmail(managerId).then(function (email) {
							if (!email) return;
							user.id = managerId;
							setupProperty(user, 'email', email);
						});
					});
				});
			}
			return getUserEmail(user.id).then(function (email) {
				if (!email) return;
				setupProperty(user, 'email', email);
			});
		});
	}).then(function () {
		if (!user) return;
		return deferred.map(props, function (propName) {
			// user.id is either id of bp owner, or its manager (in case user does not have account)
			return userStorage.get(user.id + '/' + propName).then(function (data) {
				if (!data || !unserializeValue(data.value)) return;
				setupProperty(user, propName, unserializeValue(data.value));
			});
		});
	}).then(function () {
		return user;
	});
};