'use strict';

var tableColumns = require('./table-columns');

exports.columns = [
	tableColumns.businessProcessStatusColumn,
	tableColumns.businessProcessServiceColumn,
	tableColumns.businessProcessSubmitterTypeColumn,
	tableColumns.businessProcessBusinessNameColumn,
	tableColumns.businessProcessCreationDateColumn,
	tableColumns.businessProcessCertificatesListColumn
];
