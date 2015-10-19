'use strict';

var db = require('mano').db;

module.exports = function (user, BusinessProcess) {
	db._postponed_ += 1;
	var businessProcess = new BusinessProcess();
	user.initialBusinessProcesses.add(businessProcess);
	user.currentBusinessProcess = businessProcess;
	db._postponed_ -= 1;
};
