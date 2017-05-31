'use strict';

var db                    = require('../db')
  , _                     = require('mano').i18n
  , capitalize            = require('es5-ext/string/#/capitalize')
  , tableColumns          = require('./components/table-columns')
  , toArray               = require('es5-ext/object/to-array')
  , initTableSortingOnClient = require('./utils/init-table-sorting-on-client');

exports._parent = require('./statistics-files');

exports['files-nav']           = { class: { 'submitted-menu-item-active': true } };
exports['files-details-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var certificates = {};

	this.statistics.businessProcess.forEach(function (serviceData, serviceName) {
		var BusinessProcess      = db['BusinessProcess' + capitalize.call(serviceName)]
		  , businessProcessProto = BusinessProcess.prototype
		  , certificatesMap      = businessProcessProto.certificates.map;

		serviceData.certificate.forEach(function (certificateData, certificateName) {
			if (!certificates[certificateName]) {
				certificates[certificateName] = { document: certificatesMap[certificateName], data: [] };
			}

			certificates[certificateName].data.push({
				data: certificateData,
				label: businessProcessProto.label,
				businessProcessType: BusinessProcess
			});
		});
	});

	var statsTable = table(
		{ class: 'statistics-table statistics-table-registrations' },
		thead(tr(
			th(_("Certificate")),
			th(),
			th({ class: "statistics-table-header-waiting" }, _("Submitted")),
			th({ class: "statistics-table-header-pending" }, _("Pending")),
			th({ class: "statistics-table-header-sentback" }, _("Pending for correction")),
			th({ class: "statistics-table-header-sentback" }, _("Rejected")),
			th({ class: "statistics-table-header-success" }, _("Validated")),
			th({ class: "statistics-table-header-success" }, _("Processed and ready for pickup")),
			th({ class: "statistics-table-header-success" }, _("Withdrawn"))
		)),
		tbody(
			toArray(certificates, function (data) {
				var doc = data.document;
				return data.data.map(function (data) {
					return tr(
						td(doc.abbr),
						td(span({
							class: 'hint-optional hint-optional-right',
							'data-hint': data.label
						}, tableColumns.getServiceIcon({ constructor: data.businessProcessType }))),
						td({ class: 'statistics-table-number' }, data.data._waiting),
						td({ class: 'statistics-table-number' }, data.data._pending),
						td({ class: 'statistics-table-number' }, data.data._sentBack),
						td({ class: 'statistics-table-number' }, data.data._rejected),
						td({ class: 'statistics-table-number' }, data.data._approved),
						td({ class: 'statistics-table-number' }, data.data._pickup),
						td({ class: 'statistics-table-number' }, data.data._withdrawn)
					);
				});
			})
		)
	);

	initTableSortingOnClient(statsTable);
};
