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
	flow: {
		decorateContext: function () {
			this.processingStepsMeta = processingStepsMeta;
		},
		view: require('../view/statistics-flow-certificates')
	},
	'flow/by-role': {
		view: require('../view/statistics-flow-roles')
	},
	'flow/by-operator': {
		view: require('../view/statistics-flow-operators')
	},
	'flow/rejections': {
		view: require('../view/statistics-flow-rejections')
	},

	profile: require('../view/user-profile')
};
