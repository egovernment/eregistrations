'use strict';

var memoize         = require('memoizee/plain')
  , validDbType     = require('dbjs/valid-dbjs-type')
  , defineStatusLog = require('../status-log');

module.exports = memoize(function (Target) {
	var db, StatusLog;
	validDbType(Target);
	db = Target.database;
	StatusLog = defineStatusLog(db);

	Target.prototype.define('statusLog', { type: StatusLog, multiple: true });

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
