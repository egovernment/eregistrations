'use strict';

var array         = require('es5-ext/array/valid-array')
  , object        = require('es5-ext/object/valid-object')
  , value         = require('es5-ext/object/valid-value')
  , includes      = require('es5-ext/string/#/contains')
  , memoize       = require('memoizee/plain')
  , ReactiveTable = require('reactive-table')
  , ReactiveList  = require('reactive-table/list')
  , location      = require('mano/lib/client/location')

  , create = Object.create, toLowerCase = String.prototype.toLowerCase;

var getFilter = memoize(function (query, propNames) {
	return function (user) {
		return propNames.some(function (name) {
			if (!user[name]) return;
			return includes.call(toLowerCase.call(user[name]), query);
		});
	};
}, { length: 1 });

module.exports = function (options) {
	var list, table, users, i18n, columns, searchPropertyNames, status, search, set, pathname
	  , active, reset;
	object(options);
	columns = object(options.columns);
	i18n = options.i18n ? object(options.i18n) : create(null);

	object(options.users);

	reset = function () {
		var query;
		if (!active) return;
		if (status) list.set = users[status.value] || users[''];
		if (search) {
			query = search.value;
			list.filter = query ? getFilter(query.trim().toLowerCase(), searchPropertyNames) : undefined;
		}
	};

	if (options.users['']) {
		users = options.users;
		status = location.query.get(i18n.status || 'status');
		status.on('change', reset);
		set = options.users[''];
	} else {
		set = options.users;
	}

	if (options.searchPropertyNames) {
		searchPropertyNames = array(options.searchPropertyNames);
		search = location.query.get(i18n.search || 'search');
		search.on('change', reset);
	}

	pathname = value(options.pathname);
	location.on('change', function () {
		active = (this.pathname === pathname);
		reset();
	});

	list = new ReactiveList(set, options.compare);
	table = new ReactiveTable(document, list, columns);

	if (options.id) table.table.id = options.id;
	if (options.class) table.table.className = options.class;

	active = location.pathname === pathname;
	reset();

	return table;
};
