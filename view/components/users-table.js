'use strict';

var toNatural            = require('es5-ext/number/to-pos-integer')
  , forEach              = require('es5-ext/object/for-each')
  , object               = require('es5-ext/object/valid-object')
  , callable             = require('es5-ext/object/valid-callable')
  , value                = require('es5-ext/object/valid-value')
  , stringifiable        = require('es5-ext/object/validate-stringifiable-value')
  , once                 = require('timers-ext/once')
  , ObservableValue      = require('observable-value')
  , ReactiveTable        = require('reactive-table')
  , ReactiveList         = require('reactive-table/list')
  , location             = require('mano/lib/client/location')
  , db                   = require('mano').db
  , fixLocationQuery     = require('../../utils/fix-location-query')
  , serializeSnapshotKey = require('../../utils/serialize-to-snapshot-key')
  , getFilter            = require('../../utils/get-users-filter')
  , getUsersSnapshot     = require('../../utils/get-users-snapshot')
  , Pagination           = require('./pagination')

  , ceil = Math.ceil, create = Object.create, keys = Object.keys;

module.exports = function (snapshots, options) {
	var list, table, pagination, i18n, columns
	  , statusQuery, searchQuery, pathname, pageLimit, statusMap, customFilter
	  , active, update, appName, pageQuery, inSync, isPartial, tableStyle, snapshotKey
	  , lastTableHeight = '', customFilterQuery, isActive;

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
	if (options.customFilter != null) {
		customFilter = object(options.customFilter);
		stringifiable(customFilter.name);
		forEach(object(customFilter.filters), callable);
	}
	if (options.isActive != null) isActive = callable(options.isActive);
	inSync = new ObservableValue(false);
	isPartial = (function () {
		var snapshotData = { appName: appName };
		if (statusMap[i18n.all || 'all']) snapshotData.status = i18n.all || 'all';
		return db.User.dataSnapshots.get(serializeSnapshotKey(snapshotData))
			._totalSize.map(function (value) { return value > options.cacheLimits.listedUsers; });
	}());

	update = once(function () {
		var status, search, normalizedSearch, page, snapshot, usersSnapshot
		  , snapshotData, maxPage, users;
		if (!active) return;
		if (isActive && !isActive()) return;
		snapshotData = { appName: appName };

		// Resolve status
		if (statusQuery) {
			if (statusQuery.value && !statusMap[statusQuery.value]) {
				fixLocationQuery(i18n.status || 'status');
				status = '';
			} else {
				status = statusQuery.value || '';
			}
			users = statusMap[status];
			if (status) snapshotData.status = status;
		} else {
			users = statusMap[''];
		}

		if (customFilter) {
			if (customFilterQuery.value) {
				if (!customFilter.filters[customFilterQuery.value]) {
					fixLocationQuery(customFilter.name);
				} else {
					users = users.filter(customFilter.filters[customFilterQuery.value]);
					snapshotData[customFilter.name] = customFilterQuery.value;
				}
			}
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
				snapshotData.search = search;
			}
		}
		snapshot = db.User.dataSnapshots.get(serializeSnapshotKey(snapshotData));

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
			snapshotData.page = page || 1;
			// Inform remote
			snapshotKey = serializeSnapshotKey(snapshotData);
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
			snapshotData = { appName: appName };
			if (statusMap[i18n.all || 'all']) snapshotData.status = i18n.all || 'all';
			snapshotKey = serializeSnapshotKey(snapshotData);
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

	// Custom filter
	if (customFilter) {
		customFilterQuery = location.query.get(customFilter.name);
		customFilterQuery.on('change', update);
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
	table.updateState = update;

	table.inSync = inSync;
	tableStyle = window.getComputedStyle(table.table);
	inSync.on('change', function (event) {
		table.table.style.height = event.newValue ? '' : lastTableHeight;
		if (event.newValue) lastTableHeight = tableStyle.height;
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
	snapshots.on('change', function () {
		if (document.hasFocus && !document.hasFocus()) return;
		if (snapshotKey && !snapshots.has(snapshotKey)) snapshots.add(snapshotKey);
	});

	update();
	return table;
};
