'use strict';

var tableColumns = require('./table-columns');

exports.columns = [
	tableColumns.processingStepRoleColumn,
	tableColumns.processingStepBusinessNameColumn,
	tableColumns.processingStepProcessingTimeColumn,
	tableColumns.processingStepServiceColumn,
	tableColumns.processingStepGoToColumn
];
