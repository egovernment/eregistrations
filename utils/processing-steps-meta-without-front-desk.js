'use strict';

var startsWith = require('es5-ext/string/#/starts-with')
  , stepsMeta = require('../processing-steps-meta');

module.exports = function () {
	var processingStepsMetaWithoutFrontDesk = {};
	Object.keys(stepsMeta).forEach(function (key) {
		if (!startsWith.call(key, 'frontDesk')) {
			processingStepsMetaWithoutFrontDesk[key] = stepsMeta[key];
		}
	});
	return processingStepsMetaWithoutFrontDesk;
};
