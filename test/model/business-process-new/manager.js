'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , manager, bp;

	manager = new db.User();

	bp = new BusinessProcess();
	bp.manager = manager;
	a(bp.manager, manager);
};
