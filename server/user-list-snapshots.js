'use strict';

var includes               = require('es5-ext/array/#/contains')
  , forEach                = require('es5-ext/object/for-each')
  , d                      = require('d')
  , memoize                = require('memoizee/plain')
  , ObservableSet          = require('observable-set')
  , ObservableMultiSet     = require('observable-multi-set/primitive')
  , serializeKey           = require('dbjs/_setup/serialize/key')
  , Fragment               = require('dbjs-fragment')
  , ObjectFragment         = require('dbjs-fragment/object')
  , getObjectsSetFragment  = require('../model/get-objects-set-fragment')
  , serializeSnapshotKey   = require('../utils/serialize-to-snapshot-key')
  , unserializeSnapshotKey = require('../utils/unserialize-snapshot-key')
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
	pass[serializeKey(page)] = 1;
	return new ObjectFragment(dataSnapshots.get(key), pass);
});

var resolveSnapshot = memoize(function (key) {
	var snapshot = dataSnapshots.get(key), data = unserializeSnapshotKey(key)
	  , map = dataMap[data.appName], users = map[data.status || ''];
	if (data.search) users = users.filter(getUsersFilter(data.search));
	if (snapshot.totalSize !== users.size) snapshot.totalSize = users.size;
	defineProperty(snapshot, 'items', d(users));
	users._size.on('change', function (event) { snapshot.totalSize = event.newValue; });
	return snapshot;
});

var arrayToSet = function (array) {
	var set = new ObservableSet(array);
	array.on('change', function () {
		set._postponed_ += 1;
		set.forEach(function (user) {
			if (!includes.call(array, user)) set.delete(user);
		});
		array.forEach(function (user) { set.add(user); });
		set._postponed_ -= 1;
	});
	return set;
};

var resolveSnapshotPage = memoize(function (key, compare, pageLimit) {
	var data = unserializeSnapshotKey(key), snapshot = resolveSnapshot(data.snapshotKey, compare)
	  , users, serialized;
	if (data.page == null) return snapshot.items;
	users = snapshot.items.toArray(compare).slice((data.page - 1) * pageLimit, pageLimit);
	if (data.page > 1) {
		serialized = serializeUsers(users);
		if (snapshot.get(data.page) !== serialized) snapshot.set(data.page, serialized);
		users.on('change', function () { snapshot.set(data.page, serializeUsers(users)); });
	}
	return arrayToSet(users);
}, { length: 1 });

var usersFromSnapshots = function (snapshots, compare, cacheLimits) {
	var users = new ObservableMultiSet(null, getId);
	var onAdd = function (value) {
		users.sets.add(resolveSnapshotPage(value, compare, cacheLimits.usersPerPage));
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
	  , resolveUser = function (user) { return dbSubmitted.User.getById(user.__id__); }
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
	  , compare, cacheLimits) {
	var users = usersFromSnapshots(snapshotsSet, compare, cacheLimits);
	var onSnapshotAdd = function (key) {
		var data = unserializeSnapshotKey(key);
		if (data.page > 1) fragment.sets.add(getSnapshotPageFragment(data.snapshotKey, data.page));
	};
	var onSnapshotDelete = function (key) {
		var data = unserializeSnapshotKey(key);
		if (data.page > 1) fragment.sets.delete(getSnapshotPageFragment(data.snapshotKey, data.page));
	};
	getObjectsSetFragment(users, usersPass, fragment);
	getObjectsSetFragment(getComputedUsersSet(users, dbSubmitted), computedUsersPass, fragment);
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

module.exports = function (usersPass, computedUsersPass, dbSubmitted
	  , appName, usersMap, compare, cacheLimits) {

	var generalFragment;
	dataMap[appName] = usersMap;
	generalFragment = new Fragment();

	// Setup base snapshots
	forEach(usersMap, function (users, status) {
		var tokens = [appName], snapshot;
		if (status) tokens.push(status);
		snapshot = resolveSnapshot(serializeSnapshotKey(tokens), compare);
		generalFragment.sets.add(new ObjectFragment(snapshot, totalSizePropertyPass));
	});

	return function (snapshotsSet, fragment) {
		var statuses;

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
				var snapshotTokens = [appName];
				if (status) snapshotTokens.push(status);
				snapshotsSet.add(serializeSnapshotKey(snapshotTokens));
			});
			statuses.forEach(function (status) {
				var snapshotTokens = [appName];
				if (status) snapshotTokens.push(status);
				snapshotTokens.unshift(1);
				snapshotsSet.add(serializeSnapshotKey(snapshotTokens));
			});
		}

		// Add snapshots fragment
		addSnapshotsFragment(fragment, snapshotsSet
			  , usersPass, computedUsersPass, dbSubmitted
			  , compare, cacheLimits);

		return fragment;
	};
};
