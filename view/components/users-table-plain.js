'use strict';

var toNatural            = require('es5-ext/number/to-pos-integer')
  , forEach              = require('es5-ext/object/for-each')
  , object               = require('es5-ext/object/valid-object')
  , callable             = require('es5-ext/object/valid-callable')
  , stringifiable        = require('es5-ext/object/validate-stringifiable-value')
  , once                 = require('timers-ext/once')
  , ReactiveTable        = require('reactive-table')
  , ReactiveList         = require('reactive-table/list')
  , location             = require('mano/lib/client/location')
  , fixLocationQuery     = require('../../utils/fix-location-query')
  , getFilter            = require('../../utils/get-users-filter')
  , Pagination           = require('./pagination')

  , ceil = Math.ceil, create = Object.create, keys = Object.keys;

module.exports = function (options) {
	var list, table, pagination, i18n, columns
	  , statusQuery, searchQuery, pathname, pageLimit, statusMap, customFilter
	  , active, update, pageQuery, customFilterQuery, isActive;

	var getPageCount = function (value) {
		if (!value) return 1;
		return ceil(value / pageLimit);
	};

	object(options);
	columns = object(options.columns);
	i18n = options.i18n ? object(options.i18n) : create(null);
	pathname = (options.pathname != null) ? options.pathname : '/';
	pageLimit = (options.itemsPerPage != null) ? options.itemsPerPage : 50;
	statusMap = object(options.users);
	if (options.customFilter != null) {
		customFilter = object(options.customFilter);
		stringifiable(customFilter.name);
		forEach(object(customFilter.filters), callable);
	}

	if (options.isActive != null) isActive = callable(options.isActive);

	update = once(function () {
		var status, search, normalizedSearch, page, maxPage, users;
		if (!active) return;
		if (isActive && !isActive()) return;

		// Resolve status
		if (statusQuery) {
			if (statusQuery.value && !statusMap[statusQuery.value]) {
				fixLocationQuery(i18n.status || 'status');
				status = '';
			} else {
				status = statusQuery.value || '';
			}
			users = statusMap[status];
		} else {
			users = statusMap[''];
		}

		if (customFilter) {
			if (customFilterQuery.value) {
				if (!customFilter.filters[customFilterQuery.value]) {
					fixLocationQuery(customFilter.name);
				} else {
					users = users.filter(customFilter.filters[customFilterQuery.value]);
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
			}
		}
		pagination.count.value = users._size.map(getPageCount);
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
			// Assure that we have all data on board
		list.set = users;
		list.page = page || 1;
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

	if (options.id) table.table.id = options.id;
	if (options.class) table.table.className = options.class;

	location.on('change', function () {
		active = (this.pathname === pathname);
		update();
	});
	active = location.pathname === pathname;

	window.addEventListener('focus', update, false);

	update();
	return table;
};
