// Business process table handler
// Setups dedicated list manager and query handler
// (used to handle business processes table in official roles)

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , d              = require('d')
  , db             = require('mano').db
  , getData        = require('mano/lib/client/xhr-driver').get
  , ReactiveTable  = require('reactive-table')
  , Manager        = require('./manager')
  , QueryHandler   = require('./query-handler')
  , Pagination     = require('../pagination')

  , defineProperties = Object.defineProperties;

module.exports = function (conf) {
	var user = db.User.validate(conf.user)
	  , roleName = ensureString(conf.roleName)
	  , statusMap = ensureObject(conf.statusMap)
	  , getOrderIndex = ensureCallable(conf.getOrderIndex)
	  , searchFilter = ensureCallable(conf.searchFilter)
	  , columns = ensureObject(conf.columns);

	var listManager = defineProperties(new Manager(), {
		_fullItems: d(user.visitedBusinessProcesses[roleName]),
		_statusViews: d(db.views.pendingBusinessProcesses[roleName]),
		_statusMap: d(statusMap),
		_getItemOrderIndex: d(getOrderIndex),
		_getSearchFilter: d(searchFilter),
		_queryExternal: d(function (query) {
			return getData('/get-business-processes-data/', query).aside(function (result) {
				if (!result.data) return;
				result.data.forEach(function (eventStr) {
					db.unserializeEvent(eventStr, 'server-temporary');
				});
			});
		})
	});
	var queryHandler = new QueryHandler(statusMap, listManager)
	  , pagination = new Pagination('/')
	  , table = new ReactiveTable(document, null, columns);

	if (conf.id) table.table.id = conf.id;
	if (conf.class) table.table.className = conf.class;
	table.pagination = pagination;

	listManager.on('change', function () {
		pagination.current.value = listManager.page;
		pagination.count.value = listManager.pageCount;
		table.reload(listManager.list);
	});

	queryHandler.update();
	return table;
};
