'use strict';

var ensureArray    = require('es5-ext/array/valid-array')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , uncapitalize   = require('es5-ext/string/#/uncapitalize')
  , replaceContent = require('dom-ext/element/#/replace-content')
  , mano           = require('mano')
  , Manager        = require('./components/business-processes-table/manager')

  , keys = Object.keys
  , env = mano.env, _ = mano.i18n;

var setupQueryHandler =
	require('eregistrations/view/components/business-processes-table/setup-query-handler');

exports._parent = require('./print-base');

exports.main = function () {
	var statusMap     = ensureObject(exports._statusMap(this))
	  , columns       = ensureArray(exports._columns(this))
	  , getOrderIndex = ensureCallable(exports._getOrderIndex(this))
	  , stepShortPath = ensureString(exports._stepShortPath(this))
	  , container, superIsExernalQuery;

	var listManager = new Manager({
		user: this.user,
		roleName: stepShortPath,
		statusMap: statusMap,
		getOrderIndex: getOrderIndex,
		itemsPerPage: env.objectsListItemsPerPage
	});
	superIsExernalQuery = listManager._isExternalQuery;
	listManager._isExternalQuery = function (query) {
		if (!query.status) return true;
		return superIsExernalQuery.call(this, query);
	};

	var statuses = keys(statusMap).filter(function (name) { return (name !== 'all'); })
		.sort(function (a, b) { return statusMap[a].order - statusMap[b].order; });

	setupQueryHandler(listManager, '/print-business-processes-list/');

	var getSection  = function (url, businessProcesses, data) {
		return [div({ class: 'print-users-list-caption' },
			data.label, span(" (", businessProcesses.length, ")")),
			table({ class: 'print-users-list submitted-user-data-table' },
				thead(columns.map(function (column) { return th({ class: column.class }, column.head); })),
				tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: columns.length },
					_("There are no items"))) }, businessProcesses,
					function (businessProcess) {
						return tr(columns.map(function (column) {
							return td({ class: column.class }, column.data(businessProcess));
						}));
					}))];
	};

	container = section({ class: 'section-primary' });

	listManager.on('change', function () {
		var result = [];
		if (listManager.pageCount > 1) {
			result.push(p({ class: 'page' }, _("Page"), " ", listManager.page, " / ",
				listManager.pageCount));
		}
		if (listManager.query.status) {
			result.push(getSection(url, listManager.list, statusMap[listManager.query.status]));
		} else {
			result.push(ul(statuses, function (status) {
				if (statusMap[status].redundant) return;
				return getSection(url, listManager.list.filter(function (bp) {
					return (this[bp.__id__] === status);
				}, listManager.serverResult.statusMap), statusMap[status]);
			}));
		}
		replaceContent.call(container, result);
	});

	return container;
};

exports['print-page-title'] = function () { insert(this.processingStep.label); };

exports._statusMap = Function.prototype;
exports._getOrderIndex = Function.prototype;
exports._columns = Function.prototype;
exports._stepShortPath = function (context) {
	return uncapitalize.call(context.user.currentRoleResolved.slice('official'.length));
};
