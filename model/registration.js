'use strict';

var db = require('mano').db,
	StringLine = require('dbjs-ext/string/string-line')(db);

module.exports = db.Object.extend('Registration', {}, {
	label: {
		type: StringLine
	},
	requirements: {
		type: db.Function,
		multiple: true,
		value: function (user) {
			return [];
		}
	},
	certificates: {
		type: db.Function,
		multiple: true,
		value: function (user) {
			return [];
		}
	},
	costs: {
		type: db.Function,
		multiple: true,
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
