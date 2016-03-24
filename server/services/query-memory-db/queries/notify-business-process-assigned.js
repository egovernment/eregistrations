'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , notifyAssigned = require('../../../email-notifications/business-process-assigned')
  , deferred       = require('deferred')
  , aFrom          = require('es5-ext/array/from');

module.exports = function (db) {
	ensureDatabase(db);

	return function (officialId) {
		var assignedOfficial = db.User.getById(officialId)
		  , dispatchers      = db.User.filterByKey('roles', function (roles) {
			return roles.has('dispatcher');
		});

		if (!assignedOfficial) throw new Error("Official not found");

		return deferred.map(aFrom(dispatchers), function (dispatcher) {
			return notifyAssigned(dispatcher, assignedOfficial);
		});
	};
};
