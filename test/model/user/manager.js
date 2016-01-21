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
	a.deep(aFrom(manager.managedUsers), []);
	a.deep(aFrom(manager.managedBusinessProcesses), []);
	a(manager.managerDataForms instanceof db.PropertyGroupsProcess, true);

	manager.roles.add('manager');

	user = new User();
	bp = new BusinessProcess();
	user.initialBusinessProcesses.add(bp);
	bp.manager = manager;

	a(manager.roles.has('manager'), true);
	a.deep(aFrom(manager.managedUsers), [user]);
	a.deep(aFrom(manager.managedBusinessProcesses), [bp]);

	createdUser = new User();
	createdUser.manager = manager;

	a(manager.roles.has('manager'), true);
	a.deep(aFrom(manager.managedUsers), [createdUser, user]);
	a.deep(aFrom(manager.managedBusinessProcesses), [bp]);
};
