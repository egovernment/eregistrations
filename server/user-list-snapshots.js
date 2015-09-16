'use strict';

var forEach                = require('es5-ext/object/for-each')
  , callable               = require('es5-ext/object/valid-callable')
  , object                 = require('es5-ext/object/valid-object')
  , stringifiable          = require('es5-ext/object/validate-stringifiable-value')
  , d                      = require('d')
  , memoize                = require('memoizee')
  , ObservableSet          = require('observable-set')
  , ObservableMultiSet     = require('observable-multi-set/primitive')
  , validateDb             = require('dbjs/valid-dbjs')
  , serializeKey           = require('dbjs/_setup/serialize/key')
  , Fragment               = require('dbjs-fragment')
  , ObjectFragment         = require('dbjs-fragment/object')
  , getObjectsSetFragment  = require('../model/get-objects-set-fragment')
  , serializeSnapshotKey   = require('../utils/serialize-to-snapshot-key')
  , unserializeSnapshotKey = require('../utils/unserialize-snapshot-key')
  , arrayToSet             = require('../utils/array-to-set')
  , getUsersFilter         = require('../utils/get-users-filter')
  , db                     = require('mano').db

  , map = Array.prototype.map
  , defineProperty = Object.defineProperty
  , dataSnapshots = db.User.dataSnapshots
  , totalSizePropertyPass = { totalSize: 1 }
  , getId = function (obj) { return obj.__id__; }
  , dataMap = Object.create(null);

var normalizeSnapshots = function (users, snapshots, cacheLimits) {
	snapshots._postponed_ += 1;
	while (snapshots.size > cacheLimits.pageSnapshots) snapshots.delete(snapshots.first);
	snapshots._postponed_ -= 1;
	while (users.size > cacheLimits.listedUsers) snapshots.delete(snapshots.first);
};

var serializeUsers = function (users) {
	return map.call(users, function (user) { return user.__id__; }).join(',');
};
var getSnapshotPageFragment = memoize(function (key, page) {
	var pass = { totalSize: 1 };
	if (page) pass[serializeKey(page)] = 1;
	return new ObjectFragment(dataSnapshots.get(key), pass);
}, { primitive: true });

var resolveSnapshot = memoize(function (key, customFilter) {
	var snapshot = dataSnapshots.get(key), data = unserializeSnapshotKey(key)
	  , map = dataMap[data.appName], users;
	if (map) {
		users = map[data.status || ''];
		if (!users) users = new ObservableSet();
		if (customFilter && data[customFilter.name]) {
			users = users.filter(customFilter.filters[data[customFilter.name]]);
		}
		if (data.search) users = users.filter(getUsersFilter(data.search));
		if (snapshot.totalSize !== users.size) snapshot.totalSize = users.size;
		defineProperty(snapshot, 'items', d(users));
		users._size.on('change', function (event) { snapshot.totalSize = event.newValue; });
	} else {
		if (snapshot.totalSize !== 0) snapshot.totalSize = 0;
		defineProperty(snapshot, 'items', d(new ObservableSet()));
	}
	return snapshot;
}, { length: 1, primitive: true });

var resolveSnapshotPage = memoize(function (key, compare, pageLimit, customFilter) {
	var data = unserializeSnapshotKey(key), snapshot = resolveSnapshot(data.snapshotKey, customFilter)
	  , users, serialized, start;
	if (data.page == null) return snapshot.items;
	start = (data.page - 1) * pageLimit;
	users = snapshot.items.toArray(compare).slice(start, start + pageLimit);
	if (data.page > 1) {
		serialized = serializeUsers(users);
		if (snapshot.get(data.page) !== serialized) snapshot.set(data.page, serialized);
		users.on('change', function () { snapshot.set(data.page, serializeUsers(users)); });
	}
	return arrayToSet(users);
}, { length: 1, primitive: true });

var usersFromSnapshots = function (snapshots, compare, cacheLimits, customFilter) {
	var users = new ObservableMultiSet(null, getId);
	var onAdd = function (value) {
		users.sets.add(resolveSnapshotPage(value, compare, cacheLimits.usersPerPage, customFilter));
	};
	var onDelete = function (value) { users.sets.delete(resolveSnapshotPage(value)); };

	snapshots.forEach(onAdd);
	snapshots.on('change', function (event) {
		if (event.type === 'add') {
			onAdd(event.value);
			normalizeSnapshots(users, snapshots, cacheLimits);
			return;
		}
		if (event.type === 'delete') {
			onDelete(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.deleted) event.deleted.forEach(onDelete);
			if (event.added) {
				event.added.forEach(onAdd);
				normalizeSnapshots(users, snapshots, cacheLimits);
			}
			return;
		}
		console.log("Errorneous event:", event);
		throw new TypeError("Unsupported event: " + event.type);
	});
	normalizeSnapshots(users, snapshots, cacheLimits);
	return users;
};

var getComputedUsersSet = function (users, dbSubmitted) {
	var computedUsers = [], set
	  , resolveUser = function (user) { return dbSubmitted.Object.getById(user.__id__); }
	  , onAdd = function (user) { set.add(resolveUser(user)); }
	  , onDelete = function (user) { set.delete(resolveUser(user)); };

	users.forEach(function (user) { computedUsers.push(resolveUser(user)); });
	set = new ObservableSet(computedUsers);
	computedUsers = null;

	users.on('change', function (event) {
		if (event.type === 'add') {
			onAdd(event.value);
			return;
		}
		if (event.type === 'delete') {
			onDelete(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.deleted) event.deleted.forEach(onDelete);
			if (event.added) event.added.forEach(onAdd);
			return;
		}
		console.log("Errorneous event:", event);
		throw new TypeError("Unsupported event: " + event.type);
	});
	return set;
};

var addSnapshotsFragment = function (fragment, snapshotsSet
	  , usersPass, computedUsersPass, dbSubmitted
	  , compare, cacheLimits, customFilter) {
	var users = usersFromSnapshots(snapshotsSet, compare, cacheLimits, customFilter);
	var onSnapshotAdd = function (key) {
		var data = unserializeSnapshotKey(key);
		fragment.sets.add(getSnapshotPageFragment(data.snapshotKey,
			data.page > 1 ? data.page : undefined));
	};
	var onSnapshotDelete = function (key) {
		var data = unserializeSnapshotKey(key);
		fragment.sets.delete(getSnapshotPageFragment(data.snapshotKey,
			data.page > 1 ? data.page : undefined));
	};
	getObjectsSetFragment(users, usersPass, fragment);
	if (computedUsersPass) {
		getObjectsSetFragment(getComputedUsersSet(users, dbSubmitted), computedUsersPass, fragment);
	}
	snapshotsSet.forEach(onSnapshotAdd);
	snapshotsSet.on('change', function (event) {
		if (event.type === 'add') {
			onSnapshotAdd(event.value);
			return;
		}
		if (event.type === 'delete') {
			onSnapshotDelete(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.deleted) event.deleted.forEach(onSnapshotDelete);
			if (event.added) event.added.forEach(onSnapshotAdd);
			return;
		}
		console.log("Errorneous event:", event);
		throw new TypeError("Unsupported event: " + event.type);
	});
	return fragment;
};

module.exports = function (conf) {
	var usersPass, computedUsersPass, dbSubmitted, appName, usersMap, compare, cacheLimits
	  , customFilter, generalFragment;

	object(conf);
	usersPass = object(conf.pass);
	if (conf.computedPass != null) {
		computedUsersPass = object(conf.computedPass);
		dbSubmitted = validateDb(conf.computedDb);
	}
	appName = stringifiable(conf.appName);
	usersMap = object(conf.map);
	compare = callable(conf.compare);
	cacheLimits = object(conf.cacheLimits);
	if (conf.customFilter != null) customFilter = object(conf.customFilter);

	dataMap[appName] = usersMap;
	generalFragment = new Fragment();

	// Setup base snapshots
	forEach(usersMap, function (users, status) {
		var snapshotData = { appName: appName }, snapshot;
		if (status) snapshotData.status = status;
		snapshot = resolveSnapshot(serializeSnapshotKey(snapshotData), compare);
		generalFragment.sets.add(new ObjectFragment(snapshot, totalSizePropertyPass));
	});

	return function (snapshotsSet/*, fragment*/) {
		var statuses, fragment = arguments[1];

		if (!fragment) fragment = new Fragment();

		// Add general fragment
		fragment.sets.add(generalFragment);

		// Initialize snapshots set (if empty)
		if (!snapshotsSet.size) {
			statuses = [];
			forEach(usersMap, function (users, status) {
				if (status) statuses.push(status);
			});
			statuses.reverse();
			statuses.push('');
			statuses.forEach(function (status) {
				var snapshotData = { appName: appName };
				if (status) snapshotData.status = status;
				snapshotsSet.add(serializeSnapshotKey(snapshotData));
			});
			statuses.forEach(function (status) {
				var snapshotData = { appName: appName };
				if (status) snapshotData.status = status;
				snapshotData.page = 1;
				snapshotsSet.add(serializeSnapshotKey(snapshotData));
			});
		}

		// Add snapshots fragment
		addSnapshotsFragment(fragment, snapshotsSet
			  , usersPass, computedUsersPass, dbSubmitted
			  , compare, cacheLimits, customFilter);

		return fragment;
	};
};
