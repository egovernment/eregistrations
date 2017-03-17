'use strict';

var tableColumns = require('./table-columns');

module.exports = [
	// Rejection reason
	// Star
	// Number
	// Operator
	// Role
	tableColumns.businessProcessRejectionDateColumn,
	tableColumns.businessProcessBusinessNameColumn,
	tableColumns.businessProcessGoToColumn
];
