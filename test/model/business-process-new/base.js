'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess = new BusinessProcess();

	a(businessProcess.isFromEregistrations, true);
	a(businessProcess.submissionNumber.toString(), '0');
	businessProcess.submissionNumber.number = 15;
	a(businessProcess.submissionNumber.toString(), '15');
};
