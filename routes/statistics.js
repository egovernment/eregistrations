'use strict';

var ensureObject = require('es5-ext/object/valid-object');

module.exports = function (processingStepsMeta) {
	ensureObject(processingStepsMeta);

	return {
		'/': require('../view/statistics-dashboard'),
		'pending-files': {
			decorateContext: function () { this.processingStepsMeta = processingStepsMeta; },
			view: require('../view/statistics-files-pending')
		},
		'completed-files': require('../view/statistics-files-completed'),
		'rejected-files': require('../view/statistics-files-rejected'),
		accounts: require('../view/statistics-files-accounts'),
		'per-role': require('../view/statistics-time-per-role'),
		'per-person': require('../view/statistics-time-per-person'),
		analysis: require('../view/statistics-analysis'),

		profile: require('../view/user-profile')
	};
};
