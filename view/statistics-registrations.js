'use strict';

var capitalize = require('es5-ext/string/#/capitalize')
  , toArray    = require('es5-ext/object/to-array')
  , _          = require('mano').i18n
  , db         = require('../db');

exports._parent = require('./statistics-base');

exports['registrations-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var certs = {};
	this.statistics.businessProcess.forEach(function (data, name) {
		var proto = db['BusinessProcess' + capitalize.call(name)].prototype
		  , certsMap = proto.certificates.map;
		data.certificate.forEach(function (data, name) {
			if (!certs[name]) certs[name] = { document: certsMap[name], data: [] };
			certs[name].data.push({ data: data, label: proto.label });
		});
	});

	table({ class: 'statistics-table statistics-table-registrations' },
		thead(tr(
			th(),
			th(),
			th(_("Service")),
			th({ class: "statistics-table-header-waiting" }, _("Waiting")),
			th({ class: "statistics-table-header-pending" }, _("Pending")),
			th({ class: "statistics-table-header-sentback" }, _("Rejected")),
			th({ class: "statistics-table-header-success" }, _("Validated"))
		)),
		tbody(
			toArray(certs, function (data) {
				var doc = data.document;
				return data.data.map(function (data) {
					return tr(td(doc.abbr), td(doc.label), td(data.label), td(data.data._waiting),
						td(data.data._pending), td(data.data._rejected),
						td(data.data._approved));
				});
			})
		));
};
