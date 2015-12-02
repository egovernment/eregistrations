'use strict';

var ensureArray    = require('es5-ext/array/valid-array')
  , toNatural      = require('es5-ext/number/to-pos-integer')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , ensureObject   = require('es5-ext/object/valid-object')
  , hyphenToCamel  = require('es5-ext/string/#/hyphen-to-camel')
  , replaceContent = require('dom-ext/element/#/replace-content')
  , mano           = require('mano')
  , location       = require('mano/lib/client/location')
  , Manager        = require('./components/business-processes-table/manager')
  , arrayToSet     = require('../utils/array-to-set')
  , findKey        = require('es5-ext/object/find-key')

  , keys = Object.keys, ceil = Math.ceil
  , env = mano.env, _ = mano.i18n;

var setupQueryHandler =
	require('eregistrations/view/components/business-processes-table/setup-query-handler');

exports._parent = require('./print-base');

var generateMainContent = function () {
	var statusMap = ensureObject(exports._statusMap())
	  , columns = ensureArray(exports._columns())
	  , roleName = hyphenToCamel.call(this.appName.slice('official-'.length))
	  , getOrderIndex = ensureCallable(exports._getOrderIndex())
	  , container, superIsExernalQuery;

	var listManager = new Manager({
		user: this.user,
		roleName: roleName,
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
			table({ class: 'print-users-list' },
				thead(columns.map(function (column) { return th({ class: column.class }, column.head); })),
				tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: columns.length },
					_("There are no items"))) }, businessProcesses,
					function (businessProcess) {
						return tr(columns.map(function (column) {
							return td({ class: column.class }, column.data(businessProcess));
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

// Legacy generator (to be removed once ELS is migrated to new data handling)
var legacyGenerateMainContent = function () {
	var statusMap = exports._statusMap(this)
	  , perPage = exports._cacheLimits(this).usersPerPage;

	var getPageCount = function (value) {
		if (!value) return 1;
		return ceil(value / perPage);
	};
	var getSection  = function (businessProcesses, data) {
		return [div({ class: 'print-users-list-caption' },
			data.label, span(" (", businessProcesses._length, ")")),
			table({ class: 'print-users-list' },
				exports._businessProcessesTable(businessProcesses))];
	};

	return section({ id: 'main' },
		mmap(location.query.get('status'), function (value) {
			var status, businessProcesses, pageCount;
			if (value == null) {
				if (statusMap['']) {
					status = '';
				} else {
					status = findKey(statusMap, function (item) { return item.default; });
					if (!status) {
						return;
					}
				}
			} else if (value && statusMap[value]) {
				status = value;
			} else {
				return;
			}
			businessProcesses = statusMap[status].data;
			pageCount = businessProcesses._size.map(getPageCount);
			return mmap(location.query.get('page'), function (value) {
				var page, result = []
				  , businessProcessesSnapshot = businessProcesses.toArray(exports._defaultSort);
				if ((value == null) || (value === '1')) {
					page = 1;
				} else {
					page = toNatural(value);
					if (!page) return;
					if (String(page) !== value) return;
				}
				result.push(_if(gt(pageCount, 1), p({ class: 'page' }, _("Page"), page, " /",
					pageCount)));
				businessProcessesSnapshot =
					businessProcessesSnapshot.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
				if (status !== 'all') {
					result.push(getSection(businessProcessesSnapshot, statusMap[status]));
				} else {
					businessProcessesSnapshot = arrayToSet(businessProcessesSnapshot);
					result.push(ul(keys(statusMap).filter(function (name) {
						return name !== 'all';
					}).sort(function (a, b) {
						return statusMap[a].order - statusMap[b].order;
					}), function (state) {
						return getSection(businessProcessesSnapshot.and(statusMap[state].data)
							.toArray(exports._defaultSort), statusMap[state]);
					}));
				}
				return _if(gt(page, pageCount), null, result);
			});
		}));
};

exports.main = function () {
	if (exports._businessProcessesTable !== Function.prototype) {
		return legacyGenerateMainContent.apply(this, arguments);
	}
	return generateMainContent.apply(this, arguments);
};

exports['print-page-title'] = function () { insert(this.processingStep.label); };

exports._statusMap = Function.prototype;
exports._getOrderIndex = Function.prototype;
exports._columns = Function.prototype;

// Legacy extensions (to be removed once ELS is migrated to new data handling)
exports._businessProcessesTable = Function.prototype;
exports._defaultSort = Function.prototype;
exports._cacheLimits = Function.prototype;
