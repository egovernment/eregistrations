'use strict';

module.exports = exports = require('../business-process-revision');

exports._processingTabLabel = function () {
	return '4. ' + this.processingStep.label;
};
