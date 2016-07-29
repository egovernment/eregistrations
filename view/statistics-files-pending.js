'use strict';

var capitalize          = require('es5-ext/string/#/capitalize')
  , toArray             = require('es5-ext/object/to-array')
  , add                 = require('observable-value/add')
  , _                   = require('mano').i18n
  , db                  = require('../db')
  , resolveFullStepPath = require('../utils/resolve-processing-step-full-path');

exports._parent = require('./statistics-files');

var mapSize = function (val) { return (val == null) ? '-' : val; };

var generateRow = function (label, data, getValue) {
	var attrs;
	if (typeof label === 'object') {
		attrs = label;
		label = data;
		data = getValue;
		getValue = arguments[3];
	}
	return tr(
		attrs,
		td(label),
		data.map(function (data) {
			var result = getValue(data.data);
			return td(result ? result.map(mapSize) : '-');
		}),
		td(add.apply(null, data.map(function (data) {
			var result = getValue(data.data);
			return result ? result.or(0) : 0;
		})))
	);
};

var generateProcessingStepRows =
	function (label, services, getData, processingStepsMeta, cssClass, filter) {
		return [
			generateRow({ class: ['statistics-table-sub-header', cssClass] }, label, services, getData),
			toArray(processingStepsMeta, function (data, name) {
				if (filter && !filter(data, name, processingStepsMeta)) return;
				var step = db['BusinessProcess' + capitalize.call(data._services[0])].prototype
					.processingSteps.map.getBySKeyPath(resolveFullStepPath(name));
				return generateRow(step.label, services,
					function (data) {
						data = data.atPartB.getBySKeyPath(name);
						return data ? getData(data) : null;
					});
			})
		];
	};

exports['files-nav'] = { class: { 'pills-nav-active': true } };
exports['pending-files-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var services = toArray(this.statistics.businessProcess, function (data, name) {
		return {
			name: name,
			data: data,
			service: db['BusinessProcess' + capitalize.call(name)].prototype
		};
	});

	table({ class: 'statistics-table' },
		thead(tr(
			th(),
			services.map(function (data) { return th(data.service.label); }),
			th(_("Total"))
		)),
		tbody(
			generateRow({ class: 'statistics-table-sub-header statistics-table-sub-header-overall' },
				_("Files in Part A"), services,
				function (data) { return data.atPartA._all; }),
			generateRow(_("No pages completed"), services,
				function (data) { return data.atPartA._atGuide; }),
			generateRow({ class: 'statistics-table-sub-sub-header' }, _("Guide completed"), services,
				function (data) { return data.atPartA.guideComplete._all; }),
			generateRow(_("Forms completed"), services,
				function (data) { return data.atPartA.guideComplete._dataFormsComplete; }),
			generateRow(_("Documents completed"), services,
				function (data) { return data.atPartA.guideComplete._requirementUploadsComplete; }),
			generateRow(_("Payment completed"), services,
				function (data) { return data.atPartA.guideComplete._paymentComplete; }),
			generateRow(_("At Send page"), services,
				function (data) { return data.atPartA.guideComplete._atSend; }),

			generateProcessingStepRows(_("Files pending for processing in Part B"), services,
				function (data) { return data._pending; }, this.processingStepsMeta,
				"statistics-table-sub-header-waiting"),

			generateProcessingStepRows(_("Files sent back to user for correction"), services,
				function (data) { return data._sentBack; }, this.processingStepsMeta,
				"statistics-table-sub-header-pending", function (data) { return data.sentBack; }),

			generateProcessingStepRows(_("Files rejected"), services,
				function (data) { return data._rejected; }, this.processingStepsMeta,
				"statistics-table-sub-header-sentback", function (data) { return data.rejected; }),

			generateRow({ class: 'statistics-table-sub-header statistics-table-sub-header-success' },
				_("Files completed and closed"), services, function (data) { return data._approved; })
		));
};
