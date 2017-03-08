'use strict';

var processingStepsMeta = require('../../processing-steps-meta');

module.exports = function (/* opts */) {
	var opts = Object(arguments[0]);
	return {
		name: 'step',
		ensure: function (value) {
			if (!value) {
				return opts.defaultStep || value;
			}
			if (!processingStepsMeta[value]) {
				throw new Error("Unrecognized step value " + JSON.stringify(value));
			}
			return value;
		}
	};
};
