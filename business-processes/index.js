// Collection of all business processes which where made online

'use strict';

var isFalsy = require('../utils/is-falsy');

module.exports = require('../db').BusinessProcess.instances
	.filterByKey('isFromEregistrations', true)
	.filterByKey('isDemo', isFalsy);
