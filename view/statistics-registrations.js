'use strict';

var capitalize = require('es5-ext/string/#/capitalize')
  , toArray    = require('es5-ext/object/to-array')
  , add        = require('observable-value/add')
  , _          = require('mano').i18n
  , db         = require('../db');

exports._parent = require('./statistics-base');

var sum = function (data, key) {
	return add.apply(null, data.map(function (data) { return data['_' + key].or(0); }));
};

exports['registrations-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var certs = {};
	this.statistics.businessProcess.forEach(function (data, name) {
		var certsMap = db['BusinessProcess' + capitalize.call(name)].prototype.certificates.map;
		data.certificate.forEach(function (data, name) {
			if (!certs[name]) certs[name] = { document: certsMap[name], data: [] };
			certs[name].data.push(data);
		});
	});

	table({ class: 'statistics-table' },
		thead(tr(
			th(),
			th(),
			th(_("Waiting")),
			th(_("Pending")),
			th(_("Rejected")),
			th(_("Validated"))
		)),
		tbody(
			toArray(certs, function (data) {
				return tr(td(data.document.abbr), td(data.document.label), td(sum(data.data, 'waiting')),
					td(sum(data.data, 'pending')), td(sum(data.data, 'rejected')),
					td(sum(data.data, 'approved')));
			})
		));
};
