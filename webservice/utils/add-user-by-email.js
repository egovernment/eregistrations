'use strict';

var db = require('../../db')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , mano = require('mano')
  , dbDriver = mano.dbDriver
  , deferred = require('deferred')
  , userStorage = dbDriver.getStorage('user')
  , User = require('../../model/user')(db);

/**** Notice ****
	The method retuns promise which may be rejected.
	The consumer should take care to process the response also in case of errors.
*/

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
			return foundRecord.split('/')[0];
		}).then(function (foundId) {
			if (foundId) return foundId;
			return mano.queryMemoryDb([], 'addUser', JSON.stringify(data));
		});
	});
};
