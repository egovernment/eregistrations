'use strict';

var ensureObject = require('es5-ext/object/valid-object');

module.exports = function (processingStepsMeta) {
	ensureObject(processingStepsMeta);

	return {
		'/': {
			decorateContext: function () { this.processingStepsMeta = processingStepsMeta; },
			view: require('../view/statistics-files')
		},
		accounts: require('../view/statistics-accounts'),
		registrations: require('../view/statistics-registrations'),

		profile: require('../view/user-profile')
	};
};
