// Resolves all applicable business processes for specific service (class)

'use strict';

var ensureType = require('dbjs/valid-dbjs-type')
  , isFalsy    = require('../utils/is-falsy');

var filterTypes = function (obj) {
	if (obj.master !== obj) return false;
	return (obj.constructor.prototype !== obj);
};

module.exports = function (type) {
	var BusinessProcess = ensureType(type).database.BusinessProcess;
	if (!BusinessProcess || (!BusinessProcess.isPrototypeOf(type) && (type !== BusinessProcess))) {
		throw new Error(type.__id__ + " is not BusinessProcess type");
	}
	return type.instances
		.filter(filterTypes)
		.filterByKey('isFromEregistrations', true)
		.filterByKey('isDemo', isFalsy);
};
