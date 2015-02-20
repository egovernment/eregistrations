'use strict';

var toNatural        = require('es5-ext/number/to-pos-integer')
  , array            = require('es5-ext/array/valid-array')
  , object           = require('es5-ext/object/valid-object')
  , value            = require('es5-ext/object/valid-value')
  , includes         = require('es5-ext/string/#/contains')
  , memoize          = require('memoizee/plain')
  , ObservableValue  = require('observable-value')
  , ObservableSet    = require('observable-set')
  , ReactiveTable    = require('reactive-table')
  , ReactiveList     = require('reactive-table/list')
  , location         = require('mano/lib/client/location')
  , db               = require('mano').db
  , fixLocationQuery = require('../../utils/fix-location-query')
  , Paginator        = require('./paginator')

  , ceil = Math.ceil
  , create = Object.create, toLowerCase = String.prototype.toLowerCase;

var getFilter = memoize(function (query, propNames) {
	return function (user) {
		return propNames.some(function (name) {
			if (!user[name]) return;
			return includes.call(toLowerCase.call(user[name]), query);
		});
	};
}, { length: 1 });

var resolveUsers = function (value) {
	if (!value) return [];
	return value.split(',').map(function (id) {
		return db.objects.unserialize(id, db.User);
	});
};
var getUsersSnapshot = memoize(function (observable) {
	var set = new ObservableSet(resolveUsers(observable.value));
	observable.on('change', function (event) {
		set._postponed_ += 1;
		set.clear();
		resolveUsers(event.newValue).forEach(set.add, set);
		set._postponed_ -= 1;
	});
	return set;
}, { normalize: function (args) { return args[0].dbId; } });

module.exports = function (snapshots, options) {
	var list, table, paginator, i18n, columns, searchPropertyNames
	  , statusQuery, searchQuery, pathname, limit, statusMap
	  , active, update, appName, pageQuery, inSync;

	var getPageCount = function (value) {
		if (!value) return 1;
		return ceil(value / limit);
	};
	object(options);
	columns = object(options.columns);
	i18n = options.i18n ? object(options.i18n) : create(null);
	appName = value(options.appName);
	pathname = value(options.pathname);
	limit = toNatural(options.limit) || 50;
	object(options.users);
	inSync = new ObservableValue(true);

	update = function () {
		var status, search, normalizedSearch, page, baseSnapshot, snapshot, usersSnapshot
		  , snapshotId, maxPage, users;
		if (!active) return;
		snapshotId = appName;

		// Resolve status
		if (statusQuery) {
			if (statusQuery.value && !statusMap[statusQuery.value]) {
				fixLocationQuery(i18n.status || 'status');
				status = '';
			} else {
				status = statusQuery.value || '';
			}
			snapshotId += ';' + status;
			users = statusMap[status];
		} else {
			users = options.users;
		}

		baseSnapshot = db.User.dataSnapshots.get(snapshotId);

		// Resolve search
		if (searchQuery) {
			search = searchQuery.value;
			if (search != null) {
				normalizedSearch = search.trim().toLowerCase();
				if (search !== normalizedSearch) {
					search = normalizedSearch;
					fixLocationQuery(i18n.search || 'search', search || null);
				}
			}
			if (search) {
				snapshotId += ';' + search;
				users = users.filter(getFilter(search, searchPropertyNames));
			}
		}

		snapshot = db.User.dataSnapshots.get(snapshotId);

		paginator.count.value = baseSnapshot._totalSize.map(function (value) {
			if (!value) return getPageCount(users._size);
			return snapshot._totalValue.map(getPageCount);
		});
		maxPage = paginator.count.value;

		// Resolve page
		if (pageQuery.value != null) {
			page = toNatural(pageQuery.value) || null;
			if (page === 1) page = null;
			if (page) {
				if (maxPage < page) page = (maxPage > 1) ? maxPage : null;
			}
			if (page) page = String(page);
			if (page !== pageQuery.value) fixLocationQuery(i18n.page || 'page', page);
			if (page) page = Number(page);
		}
		paginator.current.value = page || 1;

		// Update table
		if (baseSnapshot.totalSize) {
			// Remote handling
			snapshotId += ';' + (page || 1);
			usersSnapshot = getUsersSnapshot(snapshot._get(page || 1));
			if (snapshots.last !== snapshotId) snapshots.add(snapshotId);
			if (page) {
				inSync.value = usersSnapshot._size.gt(0);
				list.set = usersSnapshot;
				list.page = 1;
				return;
			}
		}
		list.set = users;
		list.page = page || 1;
		inSync.value = baseSnapshot._totalSize.map(function (value) {
			if (!value) return true;
			return snapshot._totalValue.map(function (value) {
				if (value == null) return false;
				return list.result._size.eq(value);
			});
		});
	};

	// Setup
	// Status filter
	if (options.users['']) {
		statusMap = options.users;
		statusQuery = location.query.get(i18n.status || 'status');
		statusQuery.on('change', update);
	}

	// Search filter
	if (options.searchPropertyNames) {
		searchPropertyNames = array(options.searchPropertyNames);
		searchQuery = location.query.get(i18n.search || 'search');
		searchQuery.on('change', update);
	}

	// Pagination
	pageQuery = location.query.get(i18n.page || 'page');
	pageQuery.on('change', update);

	// Table configuration
	list = new ReactiveList(options.users[''] || options.users, options.compare);
	list.limit = limit;
	table = new ReactiveTable(document, list, columns);
	table.paginator = paginator = new Paginator(pathname);

	table.inSync = inSync;
	inSync.on('change', function (event) {
		table.table.classList[event.newValue ? 'remove' : 'add']('not-in-sync');
	});

	if (options.id) table.table.id = options.id;
	if (options.class) table.table.className = options.class;

	location.on('change', function () {
		active = (this.pathname === pathname);
		update();
	});
	active = location.pathname === pathname;

	update();
	return table;
};
