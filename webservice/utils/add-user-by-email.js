'use strict';

var db = require('../../db')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , mano = require('mano')
  , dbDriver = mano.dbDriver
  , deferred = require('deferred')
  , userStorage = dbDriver.getStorage('user')
  , User = require('../../model/user')(db);

module.exports = function (data) {
	var def = deferred(), email;
	try {
		email = User.prototype.getOwnDescriptor('email').type.validate(data.email);
		def.resolve(email);
	} catch (err) {
		def.reject(err);
	}

	return def.promise.then(function (email) {
		return userStorage.searchOne({
			key: 'email',
			value: serializeValue(email)
		}, function (foundRecord) {
			return foundRecord;
		}).then(function (foundRecord) {
			if (foundRecord) return;
			return mano.queryMemoryDb([], 'addUser', JSON.stringify(data));
		});
	});
};
