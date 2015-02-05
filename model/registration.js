'use strict';

var memoize           = require('memoizee/plain')
  , validDb           = require('dbjs/valid-dbjs')
  , defineStringLine  = require('dbjs-ext/string/string-line')
  , defineInstitution = require('./institution');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(validDb(db))
	  , Institution = defineInstitution(validDb(db));

	return db.Object.extend('Registration', {
		label: {
			type: StringLine,
			value: function () {
				var Document = this.constructor.Document;
				return Document ? Document.label : null;
			}
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
		Document: { type: db.Base }, // It should be a type: Type, but can't be defined like that now
		abbr: { type: StringLine },
		institution: { type: Institution },
		isElectronic: { type: Boolean, value: false }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
