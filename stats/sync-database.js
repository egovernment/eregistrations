'use strict';

var syncDb = require('dbjs-reduce/sync')
  , isFalsy   = require('../utils/is-falsy');

module.exports = function (mainDb, statsDb) {
	var propagate, users;
	propagate = syncDb(statsDb, 'statsBase');
	users = mainDb.User.find('roles', 'user').filterByKey('isDemo', isFalsy);
	users.forEach(propagate);
	users.on('change', function (event) {
		if (event.type === 'add') {
			propagate(event.value);
			return;
		}
		if (event.type !== 'batch') return;
		if (!event.added) return;
		event.added.forEach(propagate);
	});

	return statsDb;
};
