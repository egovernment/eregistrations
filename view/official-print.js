'use strict';

exports._parent = require('./print-base');

exports.main = {
	content: function () {
		require('./_official-print')(exports._statusMap,
			exports._defaultSort,  exports._officialRoleName());
	}
};

exports._statusMap = Function.prototype;
exports._defaultSort = Function.prototype;
exports._officialRoleName = Function.prototype;
