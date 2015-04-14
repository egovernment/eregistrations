'use strict';

var memoize             = require('memoizee/plain')
  , validDb             = require('dbjs/valid-dbjs')
  , defineUser          = require('./base')
  , defineDataSnapshots = require('../lib/data-snapshots');

module.exports = memoize(function (db/* options */) {
	var options = arguments[1]
	  , User = validDb(db).User || defineUser(db, options)
	  , DataSnapshots = defineDataSnapshots(db);

	User.define('dataSnapshots', {
		type: db.Object,
		nested: true
	});
	User.dataSnapshots._descriptorPrototype_.setProperties({
		type: DataSnapshots,
		nested: true
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
