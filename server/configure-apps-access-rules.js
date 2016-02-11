// Data access/propagation rules for apps

'use strict';

var aFrom            = require('es5-ext/array/from')
  , compose          = require('es5-ext/function/#/compose')
  , findKey          = require('es5-ext/object/find-key')
  , forEach          = require('es5-ext/object/for-each')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , ensureObject     = require('es5-ext/object/valid-object')
  , endsWith         = require('es5-ext/string/#/ends-with')
  , uncapitalize     = require('es5-ext/string/#/uncapitalize')
  , memoize          = require('memoizee')
  , Set              = require('es6-set')
  , deferred         = require('deferred')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , ObservableSet    = require('observable-set')
  , ObservableMulti  = require('observable-multi-set')
  , Fragment         = require('data-fragment')
  , ensureFragment   = require('data-fragment/ensure')
  , FragmentGroup    = require('data-fragment/group')
  , ensureDriver     = require('dbjs-persistence/ensure-driver')
  , unserializeView  = require('../utils/db-view/unserialize-ids')
  , getReducedFrag   = require('./data-fragments/get-reduced-object-fragments')
  , getRedRecFrag    = require('./data-fragments/get-reduced-records-fragments')
  , getObjFragment   = require('./data-fragments/get-direct-object-fragments')
  , getColFragments  = require('./data-fragments/get-collection-fragments')
  , getPartFragments = require('./data-fragments/get-part-object-fragments')
  , getDbRecordSet   = require('./utils/get-db-record-set')
  , bpListProps      = require('../apps-common/business-process-list-properties')
  , bpListCompProps  = require('../apps-common/business-process-list-computed-properties')
  , userListProps    = require('../apps/users-admin/user-list-properties')

  , create = Object.create, keys = Object.keys, stringify = JSON.stringify
  , emptyFragment = new Fragment()
  , isOfficialRoleName = RegExp.prototype.test.bind(/^official[A-Z]/);

var joinSets = function (sets) {
	var set = new ObservableMulti(sets);
	set.promise = deferred.map(sets, function (set) { return set.promise; });
	return set;
};
module.exports = function (dbDriver, data) {
	var userStorage = ensureDriver(dbDriver).getStorage('user')
	  , reducedStorage = dbDriver.getReducedStorage()
	  , getUserData = getObjFragment(userStorage)
	  , getBusinessProcessData = getObjFragment()
	  , getUserReducedData = getReducedFrag(userStorage)
	  , getReducedData = getReducedFrag(reducedStorage)
	  , resolveOfficialSteps, processingStepsMeta, processingStepsDefaultMap = create(null)
	  , globalFragment;

	ensureObject(data);
	processingStepsMeta = ensureObject(data.processingStepsMeta);

	// Eventual fragment that should be passed to all clients
	if (data.globalFragment != null) globalFragment = ensureFragment(data.globalFragment);

	// Configure official steps (per user) resolver
	var defaultOfficialStepsResolver = function (userId) {
		var rolesSet = getDbRecordSet(userStorage, userId + '/roles');
		var resultSet = rolesSet.map(unserializeValue).filter(isOfficialRoleName)
			.map(function (roleName) { return uncapitalize.call(roleName.slice('official'.length)); });
		resultSet.promise = rolesSet.promise;
		return resultSet;
	};
	if (data.normalizeOfficialStepsPaths != null) {
		resolveOfficialSteps = compose.bind(ensureCallable(data.resolveOfficialSteps),
			defaultOfficialStepsResolver);
	} else {
		resolveOfficialSteps = defaultOfficialStepsResolver;
	}

	// Resolve default step statuses (in most cases 'pending')
	forEach(data.processingStepsMeta, function (meta, stepShortPath) {
		var defaultKey = findKey(meta, function (conf) {
			return conf.default;
		});
		if (!defaultKey) throw new Error("Not found default key for " + stringify(stepShortPath));
		processingStepsDefaultMap[stepShortPath] = defaultKey;
	});
	var resolveDefaultStatus = function (stepShortPath) {
		var defaultKey = processingStepsDefaultMap[stepShortPath];
		if (!defaultKey) throw new Error("Unrecognized step short path " + stringify(stepShortPath));
		return defaultKey;
	};

	// Configure fragment resolvers
	// Non role specific
	var getUserFragment = function (id) {
		return getUserData(id,
			{ filter: function (data) { return !endsWith.call(data.id, '/password'); } });
	};
	var getFirstPageItems = memoize(function (storage, viewName) {
		var objects = new ObservableSet(), id = 'views/' + viewName + '/21';
		objects.promise = storage.getReduced(id)(function (data) {
			if (data) objects.reload(unserializeView(unserializeValue(data.value)));
		});
		storage.on('keyid:' + id, function (event) {
			objects.reload(unserializeView(unserializeValue(event.data.value)));
		});
		return objects;
	}, { primitive: true });
	var addOfficialStepsPendingSizes = (function () {
		var resolveFragment = function (stepsShortPaths) {
			var ids;
			if (stepsShortPaths.size <= 1) return emptyFragment;
			ids = [];
			stepsShortPaths.forEach(function (stepShortPath) {
				var defaultKey = resolveDefaultStatus(stepShortPath);
				ids.push('pendingBusinessProcesses/' + stepShortPath + '/' + defaultKey + '/totalSize');
			});
			return getRedRecFrag(reducedStorage, ids);
		};
		return function (userId, fragment) {
			var stepShortNames = resolveOfficialSteps(userId)
			  , current;
			current = resolveFragment(stepShortNames);
			fragment.addFragment(current);
			stepShortNames.on('change', function () {
				var nu = resolveFragment(stepShortNames);
				if (nu === current) return;
				fragment.addFragment(nu);
				fragment.deleteFragment(current);
				current = nu;
			});
		};
	}());

	// Users Admin resolvers
	var getUserListFragment = getPartFragments(userStorage, userListProps);
	var getRecentlyVisitedUsersFragment = function (userId) {
		var list = getDbRecordSet(userStorage, userId + '/recentlyVisited/users')
			.map(function (value) { return value.slice(1); });

		return getColFragments(list, getUserListFragment);
	};
	var getUsersAdminFragment = memoize(function () {
		var fragment = new FragmentGroup();
		// First page snapshot
		fragment.addFragment(getUserReducedData('views/usersAdmin'));
		// First page list data
		fragment.addFragment(getColFragments(getFirstPageItems(userStorage, 'usersAdmin'),
			getUserListFragment));
		return fragment;
	});

	// Official roles resolvers
	var getRecentlyVisitedBusinessProcessesFragment = function (userId, roleName) {
		var list = getDbRecordSet(userStorage,
			userId + '/recentlyVisited/businessProcesses/' + roleName)
			.map(function (value) { return value.slice(1); });

		return getColFragments(list, getBusinessProcessData);
	};
	var getBusinessProcessListFragment = getPartFragments(null,
		new Set(aFrom(bpListProps).concat(aFrom(bpListCompProps))));

	var getOfficialFragment = memoize(function (stepShortPath) {
		var fragment = new FragmentGroup()
		  , defaultStatusName = resolveDefaultStatus(stepShortPath);

		// To be visited (recently pending) business processes (full data)
		fragment.add(getColFragments(getFirstPageItems(reducedStorage, 'pendingBusinessProcesses/' +
			stepShortPath + '/' + defaultStatusName).toArray().slice(0, 10), getBusinessProcessData));
		// First page snapshot for each status
		fragment.addFragment(getReducedData('views/pendingBusinessProcesses/' + stepShortPath));
		// First page list data for each status
		fragment.addFragment(getColFragments(joinSets(
			keys(processingStepsMeta[stepShortPath]).map(function (status) {
				return getFirstPageItems(reducedStorage,
					'pendingBusinessProcesses/' + stepShortPath + '/' + status);
			})
		), getBusinessProcessListFragment));
		return fragment;
	}, { primitive: true });

	return memoize(function (appId) {
		var userId, roleName, shortRoleName, custom, fragment, initialBusinessProcesses, promise;

		appId = appId.split('.');
		userId = appId[0];
		roleName = appId[1];
		custom = appId[2];

		if (!roleName) return emptyFragment; // Temporary inconsistent state (client migration)

		fragment = new FragmentGroup();

		// User profile data
		fragment.addFragment(getUserFragment(userId));
		// Sizes of pending files in official roles of user
		addOfficialStepsPendingSizes(userId, fragment);
		// Eventual global fragment
		if (globalFragment) fragment.addFragment(globalFragment);

		if (roleName === 'user') {
			if (custom) {
				// Business process application
				// Business process data
				fragment.addFragment(getBusinessProcessData(custom));
			} else {
				// My account
				// All businesss processes (full data)
				initialBusinessProcesses = getDbRecordSet(userStorage,
					userId + '/initialBusinessProcesses');
				promise = initialBusinessProcesses.promise;
				initialBusinessProcesses = initialBusinessProcesses
					.map(function (value) { return value.slice(1); });
				initialBusinessProcesses.promise = promise;
				// - All initial business processes
				fragment.addFragment(getColFragments(initialBusinessProcesses, getBusinessProcessData));
			}
			return fragment;
		}
		if (roleName === 'usersAdmin') {
			// Recently visited users (full data)
			fragment.addFragment(getRecentlyVisitedUsersFragment(userId));
			// Users Admin specific data
			fragment.addFragment(getUsersAdminFragment());
			return fragment;
		}
		if (roleName === 'metaAdmin') return fragment;

		if (isOfficialRoleName(roleName)) {
			shortRoleName = uncapitalize.call(roleName.slice('official'.length));
			// Recently visited business processes (full data)
			fragment.addFragment(getRecentlyVisitedBusinessProcessesFragment(userId, shortRoleName));
			// Official role specific data
			fragment.addFragment(getOfficialFragment(shortRoleName));
			return fragment;
		}
		console.error("\n\nError: Unrecognized role " + roleName + "\n\n");
		return fragment;
	}, { primitive: true });
};
