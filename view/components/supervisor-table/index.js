// Supervisor table handler
// Setups dedicated list manager and query handler
// (used to handle processing steps table in supervisor role)

'use strict';

var ensureObject      = require('es5-ext/object/valid-object')
  , ReactiveTable     = require('reactive-table')
  , db                = require('../../../db')
  , Pagination        = require('../pagination')
  , Manager           = require('./manager')
  , setupQueryHandler = require('./setup-query-handler');

module.exports = function (conf) {
	var columns = ensureObject(conf.columns)
	  , listManager = new Manager(conf)
	  , pagination = new Pagination(conf.tableUrl || '/')
	  , table = new ReactiveTable(document, null, columns);

	if (conf.id) table.table.id = conf.id;
	if (conf.class) table.table.className = conf.class;
	table.pagination = pagination;

	listManager.on('change', function () {
		pagination.current.value = listManager.page;
		pagination.count.value = listManager.pageCount;
		table.reload(listManager.list);
	});

	db.objects.on('update', setupQueryHandler(listManager, conf.tableUrl).update);
	return table;
};
