'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , notifyAssigned = require('../../../email-notifications/business-process-assigned');

module.exports = function (db) {
	var dispatcherEmails = ensureDatabase(db).User.filterByKey('roles', function (roles) {
		if (!roles) return false;
		return roles.has('dispatcher');
	}).map(function (dispatcher) { return dispatcher.email; });

	return function (options) {
		var assignedOfficial = db.User.getById(options.officialId);

		if (!assignedOfficial) throw new Error("Official not found");

		return notifyAssigned(dispatcherEmails, assignedOfficial, options.stepName);
	};
};
