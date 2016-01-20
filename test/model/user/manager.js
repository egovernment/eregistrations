'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineBusinessProcess = require('../../../model/business-process-new/manager');

module.exports = function (t, a) {
	var db = new Database()
	  , User = t(db)
	  , BusinessProcess = defineBusinessProcess(db)

	  , manager, user, bp, createdUser;

	manager = new User();

	a(manager.roles.has('manager'), false);
	a.deep(aFrom(manager.clients), []);
	a.deep(aFrom(manager.clientBusinessProcesses), []);

	manager.roles.add('manager');

	user = new User();
	bp = new BusinessProcess();
	user.initialBusinessProcesses.add(bp);
	bp.manager = manager;

	a(manager.roles.has('manager'), true);
	a.deep(aFrom(manager.clients), [user]);
	a.deep(aFrom(manager.clientBusinessProcesses), [bp]);

	createdUser = new User();
	createdUser.manager = manager;

	a(manager.roles.has('manager'), true);
	a.deep(aFrom(manager.clients), [createdUser, user]);
	a.deep(aFrom(manager.clientBusinessProcesses), [bp]);
};
