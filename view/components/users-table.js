'use strict';

var toNatural     = require('es5-ext/number/to-pos-integer')
  , array         = require('es5-ext/array/valid-array')
  , object        = require('es5-ext/object/valid-object')
  , value         = require('es5-ext/object/valid-value')
  , includes      = require('es5-ext/string/#/contains')
  , memoize       = require('memoizee/plain')
  , ReactiveTable = require('reactive-table')
  , ReactiveList  = require('reactive-table/list')
  , location      = require('mano/lib/client/location')
  , db            = require('mano').db

  , create = Object.create, toLowerCase = String.prototype.toLowerCase;

var getFilter = memoize(function (query, propNames) {
	return function (user) {
		return propNames.some(function (name) {
			if (!user[name]) return;
			return includes.call(toLowerCase.call(user[name]), query);
		});
	};
}, { length: 1 });

module.exports = function (snapshots, options) {
	var list, table, users, i18n, columns, searchPropertyNames
	  , statusQuery, searchQuery, set, pathname
	  , active, reset, appName, pageQuery;
	object(options);
	columns = object(options.columns);
	i18n = options.i18n ? object(options.i18n) : create(null);
	appName = value(options.appName);

	object(options.users);

	reset = function () {
		var status, search, page, snapshot, snapshotId;
		if (!active) return;
		snapshotId = appName;
		if (statusQuery) {
			status = users[statusQuery.value] ? statusQuery.value : '';
			snapshotId += ';' + status;
		}
		if (searchQuery) {
			search = searchQuery.value;
			if (search) search = search.trim().toLowerCase();
			if (search) {
				snapshotId += ';' + search;
			}
		}
		page = toNatural(pageQuery.value) || 1;
		if (page > 1) {
			snapshot = db.User.dataSnapshots.get(snapshotId).get(page);
			if (snapshots.last !== snapshot) snapshots.add(snapshot);
			list.set = snapshot;
			list.filter = undefined;
			return;
		}
		if (statusQuery) list.set = users[status];
		if (searchQuery) list.filter = search ? getFilter(search, searchPropertyNames) : undefined;
	};

	if (options.users['']) {
		users = options.users;
		statusQuery = location.query.get(i18n.status || 'status');
		statusQuery.on('change', reset);
		set = options.users[''];
	} else {
		set = options.users;
	}

	if (options.searchPropertyNames) {
		searchPropertyNames = array(options.searchPropertyNames);
		searchQuery = location.query.get(i18n.search || 'search');
		searchQuery.on('change', reset);
	}

	pageQuery = location.query.get(i18n.page || 'page');
	pageQuery.on('change', reset);

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
