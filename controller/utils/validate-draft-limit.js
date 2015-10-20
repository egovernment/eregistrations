'use strict';

var customError = require('es5-ext/error/custom');

module.exports = function (bpType) {
	return function () {
		var max = 5;
		if (this.user.businessProcesses.some(function (bp) {
			if ((bp instanceof bpType) && !bp.isSubmitted) return !--max;
			})) {
			throw customError("Too many draft business processes", "TOO_MANY_DRAFT_BUSINESS_PROCESSES");
		}
	};
};
