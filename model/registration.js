'use strict';

var db = require('mano').db,
	StringLine = require('dbjs-ext/string/string-line')(db);

module.exports = db.Object.extend('Registration', {
	requirements: {
		type: StringLine,
		multiple: true,
		value: function () {
			return [];
		}
	},
	costs: {
		type: StringLine,
		multiple: true,
		value: function () {
			return [];
		}
	},
	isMandatory: {
		type: db.Boolean,
		value: function () {
			return true;
		}

	},
	isApplicable: {
		type: db.Boolean,
		value: function () {
			return true;
		}
	},
	isRequested: {
		type: db.Boolean
	}
}, {
	label: {
		type: StringLine
	},
	abbr: {
		type: StringLine
	},
	certificates: {
		type: StringLine,
		multiple: true
	}
});
