// Resolves all applicable business processes for specific service (class)

'use strict';

var memoize    = require('memoizee')
  , ensureType = require('../ensure-business-process-type')
  , isFalsy    = require('../utils/is-falsy');

var getTypeFilter = memoize(function (type) {
	return function (obj) {
		if (obj.master !== obj) return false;
		if (obj.constructor !== type) return false;
		return (obj.constructor.prototype !== obj);
	};
});

module.exports = function (type) {
	return ensureType(type).instances
		.filter(getTypeFilter(type))
		.filterByKey('isFromEregistrations', true)
		.filterByKey('isDemo', isFalsy);
};
