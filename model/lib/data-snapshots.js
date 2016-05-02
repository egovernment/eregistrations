// Should actually be named `ListViews`, it's about storing (reactively) paginated states of lists
// e.g. if we have 100 entities, then at totalSize is 100 and at '1' we can store serialized array
// of ids of first 50 entities and at '2' we can store last 50 ids.

'use strict';

var memoize             = require('memoizee/plain')
  , validDb             = require('dbjs/valid-dbjs')
  , defineNaturalNumber = require('dbjs-ext/number/integer/u-integer');

module.exports = memoize(function (db) {
	var NaturalNumber = defineNaturalNumber(validDb(db));

	var DataSnapshots = db.Object.extend('DataSnapshots', {
		totalSize: { type: NaturalNumber }
	});

	DataSnapshots.prototype._descriptorPrototype_.setProperties({ type: db.String });
	return DataSnapshots;
}, { normalizer: require('memoizee/normalizers/get-1')() });
