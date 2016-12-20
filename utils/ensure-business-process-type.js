// Ensures provided type is either BusinessProcess class or its extension

'use strict';

var ensureType = require('dbjs/valid-dbjs-type');

module.exports = function (type) {
	var BusinessProcess = ensureType(type).database.BusinessProcess;
	if (!BusinessProcess || (!BusinessProcess.isPrototypeOf(type) && (type !== BusinessProcess))) {
		throw new Error(type.__id__ + " is not BusinessProcess type");
	}
	return type;
};
