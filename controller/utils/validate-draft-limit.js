'use strict';

var customError = require('es5-ext/error/custom');

module.exports = function (bpType) {
	return function () {
		var businessProcesses = bpType.instances.filterByKey('user', this.user)
			.filterByKey('isSubmitted', false);

		if (businessProcesses.size >= 5) {
			throw customError("Too many draft business processes", "TOO_MANY_DRAFT_BUSINESS_PROCESSES");
		}
	};
};
