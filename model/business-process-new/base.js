'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess = new BusinessProcess();

	a(businessProcess.isFromEregistrations, true);
};
