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
	Warining: If a user with a given id exits, the roles passed to this method will be setup
	for that user.
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
			var id = foundRecord.split('/')[0], promise = deferred(null);
			if (data.roles) {
				promise = deferred.map(data.roles, function (role) {
					if (!db.Role.members.has(role)) return;
					return userStorage.get(id + '/roles*' + role).then(function (foundRoleRecord) {
						if (foundRoleRecord && foundRoleRecord.value === '11') return;
						return userStorage.store(id + '/roles*' + role, serializeValue(true));
					});
				});
			}
			return promise.then(function () { return id; });
		}).then(function (foundId) {
			if (foundId) return foundId;
			return mano.queryMemoryDb([], 'addUser', JSON.stringify(data));
		});
	});
};
