'use strict';

var ensureObject = require('es5-ext/object/valid-object');

module.exports = function (processingStepsMeta) {
	ensureObject(processingStepsMeta);

	return {
		'/': require('../view/statistics-dashboard'),
		'pending-files': {
			decorateContext: function () { this.processingStepsMeta = processingStepsMeta; },
			view: require('../view/statistics-pending-files')
		},
		'completed-files': require('../view/statistics-completed-files'),
		'rejected-files': require('../view/statistics-rejected-files'),
		accounts: require('../view/statistics-accounts'),
		'per-role': require('../view/statistics-per-role'),
		'per-person': require('../view/statistics-per-person'),
		analysis: require('../view/statistics-analysis'),

		profile: require('../view/user-profile')
	};
};
