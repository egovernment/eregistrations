// Business process table handler
// Setups dedicated list manager and query handler
// (used to handle business processes table in official roles)

'use strict';

var ensureObject  = require('es5-ext/object/valid-object')
  , ReactiveTable = require('reactive-table')
  , Manager       = require('./manager')
  , QueryHandler  = require('./query-handler')
  , Pagination    = require('../pagination');

module.exports = function (conf) {
	var statusMap = ensureObject(conf.statusMap)
	  , columns = ensureObject(conf.columns)
	  , listManager = new Manager(conf);

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
