// Registration (aka Inscription) model

'use strict';

var memoize           = require('memoizee/plain')
  , ensureDb          = require('dbjs/valid-dbjs')
  , defineStringLine  = require('dbjs-ext/string/string-line')
  , defineInstitution = require('./institution');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(ensureDb(db))
	  , Institution = defineInstitution(db);

	return db.Object.extend('Registration', {
		label: {
			type: StringLine,
			value: function () {
				var Document = this.constructor.Document;
				return Document ? Document.label : null;
			}
		},
		shortLabel: {
			type: StringLine,
			value: function () {
				return this.label;
			}
		},
		isApplicable: {
			type: db.Boolean,
			value: true
		},
		isMandatory: {
			type: db.Boolean,
			value: true
		},
		isRequested: {
			type: db.Boolean,
			value: true
		},
		certificates: {
			type: StringLine,
			multiple: true,
			value: function () { return [this.key]; }
		},
		requirements: {
			type: StringLine,
			multiple: true
		},
		costs: {
			type: StringLine,
			multiple: true
		}
	}, {
		Document: { type: db.Base }, // It should be a type: Type, but can't be defined like that now
		abbr: { type: StringLine },
		institution: { type: Institution },
		isElectronic: { type: db.Boolean, value: false }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
