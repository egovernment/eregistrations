'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , notifyAssigned = require('../../../email-notifications/business-process-assigned');

module.exports = function (db) {
	ensureDatabase(db);

	return function (officialId, stepName) {
		var assignedOfficial = db.User.getById(officialId)
		  , dispatchers      = db.User.filterByKey('roles', function (roles) {
			return roles.has('dispatcher');
		});

		if (!assignedOfficial) throw new Error("Official not found");

		return notifyAssigned(dispatchers.toArray().map(function (dispatcher) {
			return dispatcher.email;
		}), assignedOfficial, stepName);
	};
};
