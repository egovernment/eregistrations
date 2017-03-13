'use strict';

var modes     = require('../../utils/statistics-flow-group-modes')
  , stringify = JSON.stringify;

module.exports = {
	name: 'mode',
	ensure: function (value) {
		if (!value) value = 'daily';
		if (!modes.has(value)) {
			throw new Error("Unrecognized mode value " + stringify(value));
		}
		return value;
	}
};
