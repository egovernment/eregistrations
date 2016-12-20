// Collection of all business processes which where made online

'use strict';

var isFalsy = require('../utils/is-falsy');

module.exports = require('../db').BusinessProcess.instances
	.filter(function (obj) {
		if (obj.master !== obj) return false;
		return (obj.constructor.prototype !== obj);
	})
	.filterByKey('isFromEregistrations', true)
	.filterByKey('isDemo', isFalsy);
