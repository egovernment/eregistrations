'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineDocument   = require('./document');

module.exports = memoize(function (db) {
	var StringLine, Document;
	validDb(db);
	StringLine = defineStringLine(db);
	Document   = defineDocument(db);
	db.Object.extend('Requirement', {
		isApplicable: { type: db.Boolean, value: true },
		label: { type: StringLine, value: function () {
			return this.constructor.label;
		} }
	}, {
		Document: { type: Document },
		label: { type: StringLine }
	});

	return db.Requirement;
}, { normalizer: require('memoizee/normalizers/get-1')() });
