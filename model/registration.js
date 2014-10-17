'use strict';

var db = require('mano').db
  , StringLine = require('dbjs-ext/string/string-line')(db)
  , Document   = require('./document');

module.exports = db.Object.extend('Registration', {
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
