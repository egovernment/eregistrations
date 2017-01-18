'use strict';

var processingStepsMeta = require('../processing-steps-meta');

module.exports = {
	'/': {
		decorateContext: function () {
			this.processingStepsMeta = processingStepsMeta;
		},
		view: require('../view/statistics-dashboard')
	},
	files: require('../view/statistics-files-completed'),
	'files/pending': {
		decorateContext: function () {
			this.processingStepsMeta = processingStepsMeta;
		},
		view: require('../view/statistics-files-pending')
	},
	'files/accounts': require('../view/statistics-files-accounts'),
	time: {
		decorateContext: function () {
			this.processingStepsMeta = processingStepsMeta;
		},
		view: require('../view/statistics-time-per-role')
	},
	'time/per-person': {
		decorateContext: function () {
			this.processingStepsMeta = processingStepsMeta;
		},
		view: require('../view/statistics-time-per-person')
	},

	profile: require('../view/user-profile')
};
