'use strict';

exports._parent = require('./print-base');

exports.main = {
	content: function () {
		console.log('HOP');
		require('./_official-print')(url, exports._statusMap(this),
			exports._defaultSort(this),  exports._officialRoleName(this), 'print');
	}
};

exports._statusMap = Function.prototype;
exports._defaultSort = Function.prototype;
exports._officialRoleName = Function.prototype;
