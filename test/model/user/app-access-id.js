'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database(), User = t(db), user = new User();
	a(user.appAccessId, user.__id__);
	db.Role.members.add('user');
	user.roles.add('user');
	a(user.appAccessId, user.__id__ + '.user');
	user.currentBusinessProcess = new db.BusinessProcessBase();
	a(user.appAccessId, user.__id__ + '.user.' + user.currentBusinessProcess.__id__);
};
