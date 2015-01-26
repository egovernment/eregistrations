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

	db.Object.extend('Registration', {
		requirements: {
			type: StringLine,
			multiple: true
		},
		costs: {
			type: StringLine,
			multiple: true
		},
		isMandatory: {
			type: db.Boolean,
			value: true

		},
		isApplicable: {
			type: db.Boolean,
			value: true
		},
		isRequested: {
			type: db.Boolean,
			value: true
		}
	}, {
		label: {
			type: StringLine
		},
		abbr: {
			type: StringLine
		},
		certificates: {
			type: Document,
			multiple: true
		}
	});

	return db.Registration;
}, { normalizer: require('memoizee/normalizers/get-1')() });
