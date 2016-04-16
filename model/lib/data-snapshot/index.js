// Not to mix with `DataSnapshots` class which is about different thing
// (serialized list views updated reactively)
//
// This one is about snaphots of data made in specific moments of time.
// Snaphots are not reactive in any way. They're updated only if given specific moment repeats
// for entity it refers to.
// e.g. We want to store a state of submitted dataForms at business process at its submission
// After it's stored it's not updated (and safe against any external changes like model changes)
// Just in case of re-submissions (e.g. return of file from sent back case) the snapshot is
// overwritten with regenerated value

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	return ensureDb(db).Object.extend('DataSnapshot', {
		jsonString: { type: db.String }
		// 'resolved' property evaluation is configured in ./eval.js
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
