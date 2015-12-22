// Base model for LRU queue of visited business processes
// It serves the server access rules, on basis of that list full
// data of business processes is propagated to user in real time

'use strict';

var memoize                    = require('memoizee/plain')
  , ensureDatabase             = require('dbjs/valid-dbjs')
  , defineLeastRecentlyVisited = require('./base')
  , defineBusinessProcess      = require('../../lib/business-process-base');

module.exports = memoize(function (db/* options */) {
	var options = arguments[1]
	  , User = defineLeastRecentlyVisited(ensureDatabase(db), options)
	  , BusinessProcess = defineBusinessProcess(db);

	User.prototype.recentlyVisited.define('businessProcesses', {
		type: db.Object,
		nested: true
	});
	User.prototype.recentlyVisited.businessProcesses._descriptorPrototype_.type = BusinessProcess;
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
