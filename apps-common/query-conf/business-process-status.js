'use strict';

var db        = require('../../db')
  , stringify = JSON.stringify;

module.exports = {
	name: 'status',
	ensure: function (value) {
		if (!value) return;

		if (!db.BusinessProcessStatus.members.has(value)) {
			throw new Error("Unrecognized status value " + stringify(value));
		}

		return value;
	}
};
