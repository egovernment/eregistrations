'use strict';

var validDb = require('dbjs/valid-dbjs')
  , defineBusinessProcess = require('./base');

module.exports = function (db) {
	var BusinessProcess;
	validDb(db);
	BusinessProcess = defineBusinessProcess(db);
	require('./registrations')(BusinessProcess);
	require('./costs')(BusinessProcess);
	require('./requirements')(BusinessProcess);
	require('./certificates')(BusinessProcess);
	require('./documents')(BusinessProcess);

	return BusinessProcess;
};
