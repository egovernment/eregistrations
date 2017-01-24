// Inspector table handler
// Setups dedicated list manager and query handler

'use strict';

var ensureObject      = require('es5-ext/object/valid-object')
  , ReactiveTable     = require('reactive-table')
  , Manager           = require('./manager')
  , setupQueryHandler = require('./setup-query-handler')
  , Pagination        = require('../pagination');

module.exports = function (conf) {
	var columns     = ensureObject(conf.columns)
	  , listManager = new Manager(conf)
	  , pagination  = new Pagination(conf.tableUrl || '/')
	  , table       = new ReactiveTable(document, null, columns);

	if (conf.id) table.table.id = conf.id;
	if (conf.class) table.table.className = conf.class;
	table.pagination = pagination;
	listManager.on('change', function () {
		pagination.current.value = listManager.page;
		pagination.count.value = listManager.pageCount;
		table.reload(listManager.list);
	});

	setupQueryHandler(listManager, conf.tableUrl);

	return table;
};
