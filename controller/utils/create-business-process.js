'use strict';

var db = require('mano').db;

module.exports = function (BusinessProcess) {
	return function () {
		db._postponed_ += 1;
		var businessProcess = new BusinessProcess();
		this.user.initialBusinessProcesses.add(businessProcess);
		this.user.currentBusinessProcess = businessProcess;
		db._postponed_ -= 1;
	};
};
