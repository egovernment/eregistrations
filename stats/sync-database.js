'use strict';

var syncDb = require('dbjs-reduce/sync');

module.exports = function (mainDb, statsDb) {
	var propagate;
	propagate = syncDb(statsDb, 'statsBase');
	mainDb.User.instances.forEach(propagate);
	mainDb.User.instances.on('change', function (event) {
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
