'use strict';

var tableColumns = require('./table-columns');

module.exports = [
	tableColumns.businessProcessStatusColumn,
	tableColumns.businessProcessServiceColumn,
	tableColumns.businessProcessSubmitterTypeColumn,
	tableColumns.businessProcessBusinessNameColumn,
	tableColumns.businessProcessCreationDateColumn,
	tableColumns.businessProcessCertificatesListColumn
];
