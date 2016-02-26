'use strict';

var db = require('mano').db;

module.exports = function (BusinessProcess) {
	return function () {
		db._postponed_ += 1;
		var businessProcess = new BusinessProcess();
		if (this.user.isDemo) businessProcess.isDemo = true;
		this.user.initialBusinessProcesses.add(businessProcess);
		if (this.manager) {
			businessProcess.manager = this.manager;
			this.manager.currentBusinessProcess = businessProcess;
		} else {
			this.user.currentBusinessProcess = businessProcess;
		}
		db._postponed_ -= 1;
	};
};
