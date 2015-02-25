'use strict';

var toNatural            = require('es5-ext/number/to-pos-integer')
  , object               = require('es5-ext/object/valid-object')
  , value                = require('es5-ext/object/valid-value')
  , memoize              = require('memoizee/plain')
  , once                 = require('timers-ext/once')
  , ObservableValue      = require('observable-value')
  , ObservableSet        = require('observable-set')
  , ReactiveTable        = require('reactive-table')
  , ReactiveList         = require('reactive-table/list')
  , location             = require('mano/lib/client/location')
  , db                   = require('mano').db
  , fixLocationQuery     = require('../../utils/fix-location-query')
  , serializeSnapshotKey = require('../../utils/serialize-to-snapshot-key')
  , getFilter            = require('../../utils/get-users-filter')
  , Pagination           = require('./pagination')

  , ceil = Math.ceil, create = Object.create, keys = Object.keys;

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
}, { normalizer: function (args) { return args[0].dbId; } });

module.exports = function (snapshots, options) {
	var list, table, pagination, i18n, columns
	  , statusQuery, searchQuery, pathname, pageLimit, statusMap
	  , active, update, appName, pageQuery, inSync, isPartial;

	var getPageCount = function (value) {
		if (!value) return 1;
		return ceil(value / pageLimit);
	};
	object(options);
	columns = object(options.columns);
	i18n = options.i18n ? object(options.i18n) : create(null);
	appName = value(options.appName);
	pathname = value(options.pathname);
	value(options.cacheLimits);
	pageLimit = options.cacheLimits.usersPerPage;
	statusMap = object(options.users);
	inSync = new ObservableValue(true);
	isPartial = (function () {
		var snapshotTokens = [appName];
		if (statusMap[i18n.all || 'all']) snapshotTokens.push(i18n.all || 'all');
		return db.User.dataSnapshots.get(serializeSnapshotKey(snapshotTokens))
			._totalSize.map(function (value) { return value > options.cacheLimits.listedUsers; });
	}());

	update = once(function () {
		var status, search, normalizedSearch, page, snapshot, usersSnapshot
		  , snapshotTokens, snapshotKey, maxPage, users;
		if (!active) return;
		snapshotTokens = [appName];

		// Resolve status
		if (statusQuery) {
			if (statusQuery.value && !statusMap[statusQuery.value]) {
				fixLocationQuery(i18n.status || 'status');
			} else {
				status = statusQuery.value || '';
			}
			users = statusMap[status];
			if (status) snapshotTokens.push(status);
		} else {
			users = statusMap[''];
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
				users = users.filter(getFilter(search));
				snapshotTokens.push(search);
			}
		}
		snapshot = db.User.dataSnapshots.get(serializeSnapshotKey(snapshotTokens));

		pagination.count.value = isPartial.value
			? snapshot._totalSize.map(getPageCount) : users._size.map(getPageCount);
		maxPage = pagination.count.value;

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
		pagination.current.value = page || 1;

		// Update table
		if (isPartial.value) {
			// We rely on snapshots functionality
			snapshotTokens.unshift(page || 1);
			// Inform remote
			snapshotKey = serializeSnapshotKey(snapshotTokens);
			if (snapshots.last !== snapshotKey) snapshots.add(snapshotKey);
			if (page) {
				// Rely on remote prepared snapshot
				usersSnapshot = getUsersSnapshot(snapshot._get(page));
				inSync.value = usersSnapshot._size.gt(0);
				list.set = usersSnapshot;
				list.page = 1;
				return;
			}
			inSync.value = snapshot._totalSize.map(function (value) {
				if (value == null) return false;
				return users._size.gtOrEq(value > pageLimit ? pageLimit : value);
			});
		} else {
			// Assure that we have all data on board
			snapshotTokens = [appName];
			if (statusMap[i18n.all || 'all']) snapshotTokens.push(i18n.all || 'all');
			snapshotKey = serializeSnapshotKey(snapshotTokens);
			if (snapshots.last !== snapshotKey) snapshots.add(snapshotKey);
		}
		list.set = users;
		list.page = page || 1;
		inSync.value = true;
	});

	// Setup
	// Status filter
	if (keys(statusMap).length > 1) {
		statusQuery = location.query.get(i18n.status || 'status');
		statusQuery.on('change', update);
	}

	// Search filter
	if (options.searchFilter) {
		searchQuery = location.query.get(i18n.search || 'search');
		searchQuery.on('change', update);
	}

	// Pagination
	pageQuery = location.query.get(i18n.page || 'page');
	pageQuery.on('change', update);

	// Table configuration
	list = new ReactiveList(statusMap[''], options.compare);
	list.limit = pageLimit;
	table = new ReactiveTable(document, list, columns);
	table.pagination = pagination = new Pagination(pathname);

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

	isPartial.on('change', update);
	window.addEventListener('focus', update, false);

	update();
	return table;
};
