'use strict';

var toNatural        = require('es5-ext/number/to-pos-integer')
  , array            = require('es5-ext/array/valid-array')
  , object           = require('es5-ext/object/valid-object')
  , value            = require('es5-ext/object/valid-value')
  , includes         = require('es5-ext/string/#/contains')
  , memoize          = require('memoizee/plain')
  , ObservableValue  = require('observable-value')
  , _if              = require('observable-value/if')
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

module.exports = function (snapshots, options) {
	var list, table, paginator, users, i18n, columns, searchPropertyNames
	  , statusQuery, searchQuery, set, pathname, limit
	  , active, update, appName, pageQuery, inSync;

	var getInSyncObservable = memoize(function (status) {
		var snapshot = db.User.dataSnapshots.get(appName + ';' + status);
		return _if(snapshot._totalSize, users[status]._size.eq(_if(snapshot._totalSize.gt(limit),
			limit, snapshot._totalSize)), true);
	});
	object(options);
	columns = object(options.columns);
	i18n = options.i18n ? object(options.i18n) : create(null);
	appName = value(options.appName);
	pathname = value(options.pathname);
	limit = toNatural(options.limit) || 50;
	object(options.users);
	inSync = new ObservableValue(true);

	update = function () {
		var status, search, normalizedSearch, page, snapshot, snapshotId, maxPage;
		if (!active) return;
		snapshotId = appName;

		// Resolve status
		if (statusQuery) {
			if (statusQuery.value && !users[statusQuery.value]) {
				fixLocationQuery(i18n.status || 'status');
				status = '';
			} else {
				status = statusQuery.value || '';
			}
			snapshotId += ';' + status;
		}

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
			}
		}

		snapshot = db.User.dataSnapshots.get(snapshotId);
		maxPage = paginator.count.value = snapshot.totalSize ? ceil(snapshot.totalSize / limit) : 1;

		// Resolve page
		if (pageQuery.value != null) {
			page = toNatural(pageQuery.value) || null;
			if (page === 1) page = null;
			if (page) {
				if (maxPage < page) page = (maxPage > 1) ? maxPage : null;
			}
			if (page) page = String(page);
			if (page !== pageQuery.value) fixLocationQuery(i18n.page || 'page');
			if (page) page = Number(page);
		}
		paginator.current.value = page || 1;

		// Update table
		if (page) {
			snapshot = snapshot.get(page);
			if (snapshots.last !== snapshot) snapshots.add(snapshot);
			inSync.value = snapshot._size.gt(0);
			list.set = snapshot;
			list.filter = undefined;
			return;
		}
		inSync.value = getInSyncObservable(status);
		if (statusQuery) list.set = users[status];
		if (searchQuery) list.filter = search ? getFilter(search, searchPropertyNames) : undefined;
	};

	// Setup
	// Status filter
	if (options.users['']) {
		users = options.users;
		statusQuery = location.query.get(i18n.status || 'status');
		statusQuery.on('change', update);
		set = options.users[''];
	} else {
		set = options.users;
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
	list = new ReactiveList(set, options.compare);
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
