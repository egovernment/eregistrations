'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db       = new Database()
	  , RoleMeta = t(db);

	var testRole = new RoleMeta();
	a(testRole.canBeDestroyed, true);
};
