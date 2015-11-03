'use strict';

var db      = require('mano').db
  , debug   = require('debug-ext')('clean-demo-users')
  , verbose = require('debug-ext')('clean-demo-users:verbose')
  , now     = require('microtime-x')

  , users   = db.BusinessProcess.instances.filterByKey('isDemo', true)
  , day     = 24 * 60 * 60 * 1000; // in milliseconds

var cleanDemoUsers = function () {
	var lastWeek = now() - 7 * day * 1000; // in microseconds

	debug('deleting demo users inactive since %s', lastWeek);

	++db._postponed;
	users.forEach(function (user) {
		if (user.demoLastAccessed && user.demoLastAccessed < lastWeek) {
			debug("deleting user: %s", user.__id__);

			user.initialBusinessProcesses.forEach(function (bp) {
				verbose("deleting its business process: %s", bp.__id__);

				db.objects.delete(bp);
			});
			db.objects.delete(user);
		}
	});
	--db._postponed;
};

cleanDemoUsers();
setInterval(cleanDemoUsers, day);
