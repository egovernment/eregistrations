// Relation between BusinessProcess and User manager

'use strict';

var memoize               = require('memoizee/plain')
  , ensureDatabase        = require('dbjs/valid-dbjs')
  , defineBusinessProcess = require('./base')
  , defineUser            = require('../user/base');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcess = defineBusinessProcess(ensureDatabase(db), arguments[1])
	  , User            = db.User || defineUser(db, arguments[1]);

	BusinessProcess.prototype.defineProperties({
		// Manager account that can handle that request as well
		manager: {
			type: User,
			reverse: 'managedBusinessProcesses'
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
