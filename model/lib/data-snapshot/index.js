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

var memoize    = require('memoizee/plain')
  , ensureDb   = require('dbjs/valid-dbjs')
  , extendBase = require('../../base');

module.exports = memoize(function (db) {
	extendBase(ensureDb(db));
	return db.Object.extend('DataSnapshot', {
		jsonString: { type: db.String },
		// Generates snapshot (only if it was not generated already)
		generate: { type: db.Function, value: function (ignore) {
			if (!this.jsonString) this.regenerate();
		} },
		// Generates snapshot (in all cases, it will overwrite old snapshot if it exist)
		regenerate: { type: db.Function, value: function (ignore) {
			this.jsonString = JSON.stringify(this.owner.toJSON());
		} },
		// Resolves snapshot JSON from stringified form
		resolve: { type: db.Function, value: function (ignore) {
			return this.jsonString ? JSON.parse(this.jsonString) : null;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
