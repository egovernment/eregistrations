'use strict';

var db                          = require('../../db')
  , _                           = require('mano').i18n.bind('View: Component: Inspector')
  , capitalize                  = require('es5-ext/string/#/capitalize')
  , businessProcessTableColumns = require('./business-process-table-columns');

exports.getServiceIcon = function (businessProcess) {
	return i({ class: "fa fa-user" });
};

exports.statusColumn = {
	head: _("Status"),
	data: function (businessProcess) {
		if (!businessProcess.status) return;

		return db.BusinessProcessStatus.meta[businessProcess.status].label;
	}
};

exports.servicesColumn = {
	head: _("Service"),
	data: function (businessProcess) {
		var ServiceType;

		if (!businessProcess.serviceName) return;

		ServiceType = db['BusinessProcess' + capitalize.call(businessProcess.serviceName)];

		if (!ServiceType) return;

		return span(
			{ class: 'hint-optional hint-optional-right', 'data-hint': ServiceType.prototype.label },
			exports.getServiceIcon(businessProcess)
		);
	}
};

exports.userTypeColumn = {
	head: _("User type"),
	data: function (businessProcess) {
		if (!businessProcess.submitterType) return;

		return db.BusinessProcess.prototype.getDescriptor('submitterType')
			.type.meta[businessProcess.submitterType].label;
	}
};

exports.businessNameColumn = {
	head: _("Entity"),
	data: function (businessProcess) {
		return businessProcess.businessName;
	}
};

exports.columns = [
	exports.statusColumn,
	exports.servicesColumn,
	exports.userTypeColumn,
	exports.businessNameColumn,
	// TODO: Replace with created date
	businessProcessTableColumns.submissionDateColumn,
	businessProcessTableColumns.certificatesListColumn
];
