'use strict';

exports._parent = require('./print-base');

exports.main = require('./_official-print')(url, exports._statusMap(),
	exports._defaultSort(),  exports._officialRoleName(), 'print');

exports._statusMap = Function.prototype;
exports._defaultSort = Function.prototype;
exports._officialRoleName = Function.prototype;
