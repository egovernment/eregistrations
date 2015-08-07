'use strict';

exports._parent = require('./print-base');

exports.main = {
	content: function () {
		exports._businessProcessesTable(this);
	}
};

exports['print-page-title'] = function () {
	h2(exports._officialRoleName());
};

exports._businessProcessesTable = Function.prototype;
exports._officialRoleName = Function.prototype;
