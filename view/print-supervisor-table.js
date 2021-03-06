'use strict';

var replaceContent    = require('dom-ext/element/#/replace-content')
  , mano              = require('mano')
  , Manager           = require('./components/supervisor-table/manager')
  , db                = require('mano').db
  , stepsLabelMap     = require('../utils/processing-steps-label-map')
  , columns           = require('./components/supervisor-table-columns')
  , setupQueryHandler = require('./components/supervisor-table/setup-query-handler')
  , env = mano.env, _ = mano.i18n;

exports._parent = require('./print-base');

exports.main = function () {
	var container, listManager;

	listManager = new Manager({
		user: this.user,
		stepsMap: stepsLabelMap,
		itemsPerPage: env.objectsListItemsPerPage
	});
	setupQueryHandler(listManager, '/print-business-processes-list/');

	var getSection  = function (url, processingSteps, dataLabel) {
		return [div({ class: 'print-users-list-caption' },
			dataLabel, span(" (", processingSteps.length, ")")),
			table({ class: 'print-users-list submitted-user-data-table' },
				thead(columns.map(function (column) { return th({ class: column.class }, column.head); })),
				tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: columns.length },
						_("There are no items"))) }, processingSteps,
					function (processingStep) {
						return tr(columns.map(function (column) {
							return td({ class: column.class }, column.data(processingStep));
						}));
					}))];
	};

	container = div();

	listManager.on('change', function () {
		var result = [];
		if (listManager.pageCount > 1) {
			result.push(p({ class: 'page' }, _("Page"), " ", listManager.page, " / ",
				listManager.pageCount));
		}

		if (listManager.query.step) {
			result.push(getSection(url, listManager.list, stepsLabelMap[listManager.query.step].label));
		} else {
			result.push(getSection(url, listManager.list, _("All")));
		}
		replaceContent.call(container, result);
	});

	return container;
};

exports['print-page-title'] = function () { insert(db.Role.meta.supervisor.label); };
