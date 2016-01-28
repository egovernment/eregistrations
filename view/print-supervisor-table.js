'use strict';

var ensureArray    = require('es5-ext/array/valid-array')
  , toNatural      = require('es5-ext/number/to-pos-integer')
  , ensureObject   = require('es5-ext/object/valid-object')
  , replaceContent = require('dom-ext/element/#/replace-content')
  , mano           = require('mano')
  , location       = require('mano/lib/client/location')
  , Manager        = require('./components/supervisor-table/manager')
  , arrayToSet     = require('../utils/array-to-set')
  , findKey        = require('es5-ext/object/find-key')
  , db             = require('mano').db

  , keys = Object.keys, ceil = Math.ceil
  , env = mano.env, _ = mano.i18n;

var setupQueryHandler =
	require('eregistrations/view/components/supervisor-table/setup-query-handler');

exports._parent = require('./print-base');

var generateMainContent = function () {
	var stepsMap      = ensureObject(exports._stepsMap(this))
	  , columns       = ensureArray(exports._columns(this))
	  , container, superIsExernalQuery;

	var listManager = new Manager({
		user: this.user,
		stepsMap: stepsMap,
		itemsPerPage: env.objectsListItemsPerPage
	});
	superIsExernalQuery = listManager._isExternalQuery;
	listManager._isExternalQuery = function (query) {
		return superIsExernalQuery.call(this, query);
	};

	setupQueryHandler(listManager, '/print-supervisor-list/');

	var getSection  = function (url, businessProcesses, dataLabel) {
		return [div({ class: 'print-users-list-caption' },
			dataLabel, span(" (", businessProcesses.length, ")")),
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

	container = div();

	listManager.on('change', function () {
		var result = [];
		if (listManager.pageCount > 1) {
			result.push(p({ class: 'page' }, _("Page"), " ", listManager.page, " / ",
				listManager.pageCount));
		}

		if (listManager.query.step) {
			result.push(getSection(url, listManager.list, stepsMap[listManager.query.step].label));
		} else {
			result.push(getSection(url, listManager.list, _("All")));
		}
		replaceContent.call(container, result);
	});

	return container;
};

// Legacy generator (to be removed once ELS is migrated to new data handling)
var legacyGenerateMainContent = function () {
	var stepsMap = exports._stepsMap(this)
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
		mmap(location.query.get('step'), function (value) {
			var status, businessProcesses, pageCount;
			if (value == null) {
				if (stepsMap['']) {
					status = '';
				} else {
					status = findKey(stepsMap, function (item) { return item.default; });
					if (!status) {
						return;
					}
				}
			} else if (value && stepsMap[value]) {
				status = value;
			} else {
				return;
			}
			businessProcesses = stepsMap[status].data;
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
					result.push(getSection(businessProcessesSnapshot, stepsMap[status]));
				} else {
					businessProcessesSnapshot = arrayToSet(businessProcessesSnapshot);
					result.push(ul(keys(stepsMap).filter(function (name) {
						return name !== 'all';
					}).sort(function (a, b) {
						return stepsMap[a].order - stepsMap[b].order;
					}), function (state) {
						return getSection(businessProcessesSnapshot.and(stepsMap[state].data)
							.toArray(exports._defaultSort), stepsMap[state]);
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

exports['print-page-title'] = function () { insert(db.Role.meta.supervisor.label); };

exports._stepsMap = Function.prototype;
exports._columns = Function.prototype;

// Legacy extensions (to be removed once ELS is migrated to new data handling)
exports._businessProcessesTable = Function.prototype;
exports._defaultSort = Function.prototype;
exports._cacheLimits = Function.prototype;
