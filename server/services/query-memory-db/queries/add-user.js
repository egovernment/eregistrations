'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineUser = require('../../../../model/user')
  , hash = require('mano-auth/hash')
  , pwdSeed = {
	alphaUp: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	alphaLow: 'abcdefghijklmnopqrstuvwxyz',
	chars: '!@#$%^&*()_+='
};

var genPwd = function () {
	var pwd = '', i, now;
	Object.keys(pwdSeed).forEach(function (seedKey) {
		for (i = 0; i < 5; i++) {
			pwd += pwdSeed[seedKey].charAt(Math.floor(Math.random() * pwdSeed[seedKey].length));
		}
	});
	now = String(new Date().getTime());
	for (i = 0; i < 5; i++) {
		pwd += now.charAt(Math.floor(Math.random() * now.length));
	}

	return pwd;
};

module.exports = exports = function (db) {
	ensureDatabase(db);
	var User = defineUser(db);

	return function (query) {
		var data = ensureObject(JSON.parse(query));

		return hash.hash(genPwd()).then(function (pwd) {
			if (!pwd) return;
			var user = new User();
			try {
				user.email = data.email;
				if (data.firstName) user.firstName = data.firstName;
				if (data.lastName) user.lastName = data.lastName;
				user.password = pwd;
				data.roles.forEach(function (role) {
					if (!db.Role.members.has(role)) {
						throw new Error('Attampting to assign invalid role: ' + role);
					}
					user.roles.add(role);
				});
			} catch (err) {
				user._destroy();
				throw err;
			}
			return user.__id__;
		});
	};
};
