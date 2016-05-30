'use strict';

module.exports = exports = require('../business-process-revision');

exports._processingTabLabel = function () {
	return this.processingStep.label;
};
