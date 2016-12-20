'use strict';

var Database   = require('dbjs')
  , defineUser = require('../../../model/user/base')
  , defineBusinessProcesses = require('../../../model/user/business-processes');

module.exports = function (t, a) {
	var db = new Database()
	  , User = t(defineUser(db))

	  , user = new User();
	defineBusinessProcesses(User);

	user.roles.add('user');
	a(user.canBeDestroyed, true);
	a(user.validateDestroy(), undefined);
	a(User.getById(user.__id__), user);
	user.destroy();
	a(User.getById(user.__id__), null);
	user = new User();
	user.roles.add('user');
	user.submittedBusinessProcessesSize = 1;
	a(user.canBeDestroyed, false);
	a.throws(function () {
		return user.validateDestroy();
	}, new RegExp("Cannot destroy"), "errorTest");
	a(User.getById(user.__id__), user);
	a.throws(function () {
		return user.destroy();
	}, new RegExp("Cannot destroy"), "errorTest");
	a(User.getById(user.__id__), user);
};
