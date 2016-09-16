'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineBusinessProcess = require('../../../model/business-process-new');

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
	var destroyManagedErr = new RegExp('Cannot destroy user');
	var destroyManagerErr = new RegExp('Cannot destroy user, role restriction: "manager"');

	user.manager = manager;
	user.destroy();
	a(db.User.instances.has(user), false);

	user = new User();
	user.manager = manager;
	user.password = 'abc123';
	user.email    = 'asd@asd.com';
	user = new User();
	user.roles.add('user');
	user.manager = manager;
	a(db.User.instances.has(user), true);
	bp = new BusinessProcess();
	user.initialBusinessProcesses.add(bp);
	a(db.BusinessProcess.instances.has(bp), true);
	bp.isSubmitted = true;
	user.submittedBusinessProcessesSize = 1;
	a.throws(function () {
		return user.destroy();
	}, destroyManagedErr, 'throws when has submitted process');
	a(db.BusinessProcess.instances.has(bp), true);
	bp.isSubmitted = false;
	user.delete('submittedBusinessProcessesSize');
	a(user.canManagedUserBeDestroyed, true);
	user.destroy();
	a(db.BusinessProcess.instances.has(bp), false);
	a(db.User.instances.has(user), false);

	user = new User();
	manager = new User();
	manager.roles.add('manager');
	managerValidation = new User();
	a(db.User.instances.has(manager), true);
	a(manager.canBeDestroyed, true);
	a(db.User.instances.has(manager), true);
	managerValidation.roles.add('managerValidation');
	manager.destroy();
	a(db.User.instances.has(manager), false);

	user = new User();
	user.roles.add('user');
	manager = new User();
	manager.roles.add('manager');
	user.manager = manager;
	bp = new BusinessProcess();
	user.initialBusinessProcesses.add(bp);
	bp.isSubmitted = true;
	user.submittedBusinessProcessesSize = 1;
	manager.dependentManagedUsersSize = 1;
	a(db.BusinessProcess.instances.has(bp), true);
	a(db.User.instances.has(user), true);
	a(db.User.instances.has(manager), true);
	a.throws(function () {
		return manager.destroy();
	}, destroyManagerErr, 'throws when unable to remove some managers user');
	a(db.User.instances.has(manager), true);
	a(db.BusinessProcess.instances.has(bp), true);
	a(db.User.instances.has(user), true);
	a(manager.canBeDestroyed, false);
	bp.isSubmitted = false;
	user.delete('submittedBusinessProcessesSize');
	manager.delete('dependentManagedUsersSize');
	a(manager.canBeDestroyed, true);
	manager.destroy();
	a(db.BusinessProcess.instances.has(bp), false);
	a(db.User.instances.has(user), false);
};
