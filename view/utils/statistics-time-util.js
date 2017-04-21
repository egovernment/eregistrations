'use strict';

var startsWith = require('es5-ext/string/#/starts-with');

exports.processingStepsMetaFrontDeskFilter = function (processingStepsMeta) {
	var processingStepsMetaWithoutFrontDesk = {};
	Object.keys(processingStepsMeta).forEach(function (key) {
		if (!startsWith.call(key, 'frontDesk')) {
			processingStepsMetaWithoutFrontDesk[key] = processingStepsMeta[key];
		}
	});
	return processingStepsMetaWithoutFrontDesk;
};
