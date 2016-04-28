'use strict';

module.exports = exports = require('../business-process-revision');

exports._processingTabLink = function () {
	return a({
		class: 'section-tab-nav-tab',
		id: 'tab-business-process-processing',
		href: '/' + this.businessProcess.__id__ + '/processing'
	}, this.processingStep.label);
};
