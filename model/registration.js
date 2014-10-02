'use strict';

var db = require('mano').db,
	StringLine = require('dbjs-ext/string/string-line')(db);

module.exports = db.Object.extend('Registration', {}, {
	label: {
		type: StringLine
	},
	abbr: {
		type: StringLine
	},
	requirements: {
		type: db.Function,
		value: function (user) {
			return [];
		}
	},
	certificates: {
		type: StringLine,
		multiple: true
	},
	costs: {
		type: db.Function,
		value: function (user) {
			return [];
		}
	},
	isMandatory: {
		type: db.Function,
		value: function (user) {
			return true;
		}

	},
	isOptional: {
		type: db.Function,
		value: function (user) {
			return false;
		}
	}
});
