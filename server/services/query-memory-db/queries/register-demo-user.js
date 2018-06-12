"use strict";

var ensureDatabase = require('dbjs/valid-dbjs')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject   = require('es5-ext/object/valid-object')
  , queryMaster    = require('../../query-master/slave')
  , defineUser     = require('../../../../model/user');

module.exports = exports = function (db) {
	ensureDatabase(db);
	defineUser(db);

	return function (query) {
		var userId = ensureString(ensureObject(query).userId)
		  , data   = ensureObject(query.data)
		  , user   = db.User.getById(userId);

		user.delete('isDemo');
		user.password = 'invalid';

		Object.keys(data).forEach(function (key) {
			user[key] = data[key];
		});

		return queryMaster('loadInitialBusinessProcesses', {
			userId: userId
		})(function () {
			user.initialBusinessProcesses.forEach(function (businessProcess) {
				businessProcess.delete('isDemo');
			});

			return userId;
		});
	};
};
