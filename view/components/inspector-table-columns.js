'use strict';

var _                           = require('mano').i18n.bind('View: Component: Inspector')
  , businessProcessTableColumns = require('./business-process-table-columns');

exports.statusColumn = {
	head: _("Status"),
	data: function (businessProcess) {
		return businessProcess.__id__;
	}
};

exports.userTypeColumn = {
	head: _("User type"),
	data: function (businessProcess) {
		return businessProcess._submitterType;
	}
};

exports.columns = [
	exports.statusColumn,
	businessProcessTableColumns.servicesColumn,
	exports.userTypeColumn,
	businessProcessTableColumns.businessNameColumn,
	businessProcessTableColumns.submissionDateColumn,
	businessProcessTableColumns.certificatesListColumn
];
