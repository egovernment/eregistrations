'use strict';

var createReduced = require('dbjs-reduce/create');

module.exports = function (mainDb) {
	return createReduced(mainDb, 'statsBase');
};
