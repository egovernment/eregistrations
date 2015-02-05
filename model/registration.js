'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);

	db.Object.extend('Registration', {
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
		label: {
			type: StringLine
		},
		abbr: {
			type: StringLine
		}
	});

	return db.Registration;
}, { normalizer: require('memoizee/normalizers/get-1')() });
