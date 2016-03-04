'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineBusinessProcess = require('../../../model/business-process-new/manager');

module.exports = function (t, a) {
	var db = new Database()
	  , User = t(db)
	  , BusinessProcess = defineBusinessProcess(db)

	  , manager, user, bp, createdUser, managerValidation;

	manager = new User();
	db.Role.members.add('managerValidation');

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

	user = new User();
	// not a managed user
	a(manager.destroyManagedUser(user), false);
	user.manager = manager;
	a(manager.destroyManagedUser(user), true);

	user = new User();
	user.manager = manager;
	user.roles.add('user');
	a(manager.destroyManagedUser(user), false);

	user = new User();
	user.manager = manager;
	a(db.User.instances.has(user), true);
	bp = new BusinessProcess();
	user.initialBusinessProcesses.add(bp);
	a(db.BusinessProcess.instances.has(bp), true);
	bp.isSubmitted = true;
	a(manager.destroyManagedUser(user), false);
	a(db.BusinessProcess.instances.has(bp), true);
	bp.isSubmitted = false;
	a(manager.destroyManagedUser(user), true);
	a(db.BusinessProcess.instances.has(bp), false);
	a(db.User.instances.has(user), false);

	user = new User();
	user.manager = manager;
	managerValidation = new User();
	a(db.User.instances.has(manager), true);
	a(managerValidation.destroyManager(manager), false);
	a(db.User.instances.has(manager), true);
	managerValidation.roles.add('managerValidation');
	a(managerValidation.destroyManager(manager), true);
	a(db.User.instances.has(manager), false);

	user = new User();
	manager = new User();
	manager.roles.add('manager');
	user.manager = manager;
	bp = new BusinessProcess();
	user.initialBusinessProcesses.add(bp);
	bp.isSubmitted = true;
	a(db.BusinessProcess.instances.has(bp), true);
	a(db.User.instances.has(user), true);
	a(db.User.instances.has(manager), true);
	a(managerValidation.destroyManager(manager), false);
	a(db.User.instances.has(manager), true);
	a(db.BusinessProcess.instances.has(bp), true);
	a(db.User.instances.has(user), true);
	a(managerValidation.destroyManager(manager), false);
	a(db.BusinessProcess.instances.has(bp), true);
	a(db.User.instances.has(user), true);
};
