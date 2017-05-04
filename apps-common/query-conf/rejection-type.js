'use strict';

var Set = require('es6-set')
  , rejectionReasonTypes;

rejectionReasonTypes = new Set(['rejected', 'sentBack']);

module.exports = {
	name: 'rejectionReasonType',
	ensure: function (value) {
		if (!value) return;

		if (!rejectionReasonTypes.has(value)) {
			throw new Error("Unrecognized rejection reason type value " + JSON.stringify(value));
		}

		return value;
	}
};
