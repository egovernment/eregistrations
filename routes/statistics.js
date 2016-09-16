'use strict';

var ensureObject = require('es5-ext/object/valid-object');

module.exports = function (processingStepsMeta) {
	ensureObject(processingStepsMeta);

	return {
		'/': {
			decorateContext: function () { this.processingStepsMeta = processingStepsMeta; },
			view: require('../view/statistics-dashboard')
		},
		files: require('../view/statistics-files-completed'),
		'files/pending': {
			decorateContext: function () { this.processingStepsMeta = processingStepsMeta; },
			view: require('../view/statistics-files-pending')
		},
		'files/rejected': require('../view/statistics-files-rejected'),
		'files/accounts': require('../view/statistics-files-accounts'),
		time: {
			decorateContext: function () { this.processingStepsMeta = processingStepsMeta; },
			view: require('../view/statistics-time-per-role')
		},
		'time/per-person': {
			decorateContext: function () { this.processingStepsMeta = processingStepsMeta; },
			view: require('../view/statistics-time-per-person')
		},
		analysis: require('../view/statistics-analysis'),

		profile: require('../view/user-profile')
	};
};
