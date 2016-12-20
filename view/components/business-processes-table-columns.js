'use strict';

var tableColumns = require('./table-columns');

module.exports = [
	tableColumns.businessProcessServiceColumn,
	tableColumns.businessProcessBusinessNameColumn,
	tableColumns.businessProcessSubmissionDateColumn,
	tableColumns.businessProcessWithdrawalDateColumn,
	tableColumns.businessProcessCertificatesListColumn
];
