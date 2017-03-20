'use strict';

var tableColumns = require('./table-columns');

module.exports = [
	tableColumns.businessProcessRejectionReason,
	tableColumns.businessProcessRejectionProcessor,
	tableColumns.businessProcessRejectionStep,
	tableColumns.businessProcessRejectionDateColumn,
	tableColumns.businessProcessBusinessNameColumn,
	tableColumns.businessProcessGoToColumn
];
