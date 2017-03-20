'use strict';

var tableColumns = require('./table-columns');

module.exports = [
	// Rejection reason
	// Star
	// Number
	tableColumns.businessProcessRejectionProcessor,
	tableColumns.businessProcessRejectionStep,
	tableColumns.businessProcessRejectionDateColumn,
	tableColumns.businessProcessBusinessNameColumn,
	tableColumns.businessProcessGoToColumn
];
