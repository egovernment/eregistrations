// Data access/propagation rules for apps

'use strict';

var aFrom            = require('es5-ext/array/from')
  , ensureIterable   = require('es5-ext/iterable/validate-object')
  , findKey          = require('es5-ext/object/find-key')
  , forEach          = require('es5-ext/object/for-each')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , capitalize       = require('es5-ext/string/#/capitalize')
  , endsWith         = require('es5-ext/string/#/ends-with')
  , uncapitalize     = require('es5-ext/string/#/uncapitalize')
  , memoize          = require('memoizee')
  , Set              = require('es6-set')
  , deferred         = require('deferred')
  , unserializeValue = require('dbjs/_setup/unserialize/value')
  , serializeValue   = require('dbjs/_setup/serialize/value')
  , ObservableSet    = require('observable-set')
  , ObservableMulti  = require('observable-multi-set')
  , Fragment         = require('data-fragment')
  , ensureFragment   = require('data-fragment/ensure')
  , FragmentGroup    = require('data-fragment/group')
  , ensureDriver     = require('dbjs-persistence/ensure-driver')
  , unserializeView  = require('../utils/db-view/unserialize-ids')
  , resolveStepPath  = require('../utils/resolve-processing-step-full-path')
  , getReducedFrag   = require('./data-fragments/get-reduced-object-fragments')
  , getRedRecFrag    = require('./data-fragments/get-reduced-records-fragment')
  , getAddRecFrag    = require('./data-fragments/get-add-records-to-fragment')
  , getObjFragment   = require('./data-fragments/get-direct-object-fragments')
  , getColFragments  = require('./data-fragments/get-collection-fragments')
  , getPartFragments = require('./data-fragments/get-part-object-fragments')
  , getDbRecordSet   = require('./utils/get-db-record-set')
  , getDbSet         = require('./utils/get-db-set')
  , mapDbSet         = require('./utils/map-db-set')
  , userListProps    = require('../apps/users-admin/user-list-properties')

  , create = Object.create, keys = Object.keys, stringify = JSON.stringify
  , emptyFragment = new Fragment()
  , isOfficialRoleName = RegExp.prototype.test.bind(/^official[A-Z]/);

var managerValidationUserListProps = require('../apps/manager-validation/user-list-properties');

var joinSets = function (sets) {
	var set = new ObservableMulti(sets);
	set.promise = deferred.map(sets, function (set) { return set.promise; });
	return set;
};
var getDefaultOfficialStepsResolver = function (userStorage) {
	return function (userId) {
		var rolesSet = getDbRecordSet(userStorage, userId + '/roles');
		var resultSet = rolesSet.map(unserializeValue).filter(isOfficialRoleName)
			.map(function (roleName) { return uncapitalize.call(roleName.slice('official'.length)); });
		resultSet.promise = rolesSet.promise;
		return resultSet;
	};
};

module.exports = exports = function (dbDriver, data) {
	var userStorage = ensureDriver(dbDriver).getStorage('user')
	  , getBusinessProcessData = getObjFragment()
	  , reducedStorage = dbDriver.getReducedStorage()
	  , getUserData = getObjFragment(userStorage)
	  , getUserReducedData = getReducedFrag(userStorage)
	  , getReducedData = getReducedFrag(reducedStorage)
	  , resolveOfficialSteps, processingStepsMeta, processingStepsDefaultMap = create(null)
	  , businessProcessListProperties, globalFragment, getMetaAdminFragment, getAccessRules
	  , assignableProcessingSteps;

	var getBusinessProcessStorages = require('./utils/business-process-storages');
	var getManagerUserData = getPartFragments(userStorage, new Set(['email', 'firstName',
		'initialBusinessProcesses', 'lastName', 'manager', 'canManagedUserBeDestroyed',
		'isActiveAccount', 'isInvitationSent']));
	var getManagerBusinessProcessData = getPartFragments(null, new Set(['businessName', 'isSubmitted',
		'manager', 'status']));

	ensureObject(data);
	processingStepsMeta = ensureObject(data.processingStepsMeta);

	// Eventual fragment that should be passed to all clients
	if (data.globalFragment != null) globalFragment = ensureFragment(data.globalFragment);
	if (data.getMetaAdminFragment != null) {
		getMetaAdminFragment = memoize(ensureCallable(data.getMetaAdminFragment), { length: 0 });
	}
	if (data.assignableProcessingSteps != null) {
		assignableProcessingSteps = new Set(aFrom(ensureIterable(data.assignableProcessingSteps),
			function (stepShortPath) {
				stepShortPath = ensureString(stepShortPath);
				if (!processingStepsMeta[stepShortPath]) {
					throw new Error("Unrecognized step short path " + stringify(stepShortPath));
				}
				return stepShortPath;
			}));
	}
	businessProcessListProperties =
		new Set(aFrom(ensureIterable(data.businessProcessListProperties)));

	// Configure official steps (per user) resolver
	if (data.officialStepsResolver != null) {
		resolveOfficialSteps = ensureCallable(data.officialStepsResolver);
	} else {
		resolveOfficialSteps = getDefaultOfficialStepsResolver(userStorage);
	}
	resolveOfficialSteps = memoize(resolveOfficialSteps, { length: 1, primitive: true });

	// Resolve default step statuses (in most cases 'pending')
	forEach(processingStepsMeta, function (meta, stepShortPath) {
		var defaultKey = findKey(meta, function (conf) {
			return conf.default;
		});
		if (!defaultKey) throw new Error("Not found default key for " + stringify(stepShortPath));
		processingStepsDefaultMap[stepShortPath] = defaultKey;
	});
	var resolveDefaultStatus = function (stepShortPath) {
		var defaultKey = processingStepsDefaultMap[stepShortPath];
		if (!defaultKey) {
			console.error("\n\nUnrecognized step short path " + stringify(stepShortPath));
		}
		return defaultKey;
	};

	// Configure fragment resolvers
	// Non role specific
	var addIsAccountToFragment = getAddRecFrag(userStorage, ['isActiveAccount']);
	var getUserFragment = function (id) {
		return addIsAccountToFragment(id, getUserData(id,
			{ filter: function (data) { return !endsWith.call(data.id, '/password'); } }));
	};
	var resolveViewData = function (data) {
		return unserializeView(unserializeValue(data.value)).map(function (id) {
			return id.split('/', 1)[0];
		});
	};
	var getFirstPageItems = memoize(function (storage, viewName) {
		var objects = new ObservableSet(), id = 'views/' + viewName + '/21';
		objects.promise = storage.getReduced(id)(function (data) {
			if (data) objects.reload(resolveViewData(data));
		});
		storage.on('keyid:' + id, function (event) { objects.reload(resolveViewData(event.data)); });
		return objects;
	}, { primitive: true });
	var addOfficialStepsPendingSizes = (function () {
		var resolveFragment = function (stepsShortPaths, userId) {
			var ids;
			if (!stepsShortPaths.size) return emptyFragment;
			ids = [];
			stepsShortPaths.forEach(function (stepShortPath) {
				var defaultKey = resolveDefaultStatus(stepShortPath);
				if (!defaultKey) return;
				if (assignableProcessingSteps && assignableProcessingSteps.has(stepShortPath)) {
					ids.push('views/pendingBusinessProcesses/assigned/7' + userId + '/' + stepShortPath +
						'/' + defaultKey + '/totalSize');
				} else {
					ids.push('views/pendingBusinessProcesses/' + stepShortPath + '/' + defaultKey +
						'/totalSize');
				}
			});
			return getRedRecFrag(reducedStorage, ids);
		};
		return function (userId, fragment) {
			var stepsShortPaths = resolveOfficialSteps(userId)
			  , current;
			current = resolveFragment(stepsShortPaths, userId);
			fragment.addFragment(current);
			stepsShortPaths.on('change', function () {
				var nu = resolveFragment(stepsShortPaths, userId);
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

		return getColFragments(list, getUserFragment);
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

	// Manager validation resolvers
	var getRecentlyVisitedManagerValidationUsersFragment = function (userId) {
		var list = getDbRecordSet(userStorage, userId + '/recentlyVisited/users')
			.map(function (value) { return value.slice(1); });

		return getColFragments(list, getUserFragment);
	};
	var getManagerValidationUserListFragment =
		getPartFragments(userStorage, managerValidationUserListProps);

	var getManagerValidationFragment = memoize(function () {
		var fragment = new FragmentGroup();
		// First page snapshot
		fragment.addFragment(getUserReducedData('views/managerValidation'));
		// First page list data
		fragment.addFragment(getColFragments(getFirstPageItems(userStorage, 'managerValidation'),
			getManagerValidationUserListFragment));
		return fragment;
	});

	// Official roles resolvers
	var getRecentlyVisitedBusinessProcessesFragment = function (userId, stepShortPath) {
		var list = getDbRecordSet(userStorage,
			userId + '/recentlyVisited/businessProcesses/' + stepShortPath)
			.map(function (value) { return value.slice(1); });

		return getColFragments(list, getBusinessProcessData);
	};
	var getBusinessProcessOfficialListFragment =
		getPartFragments(null, businessProcessListProperties);

	var getOfficialFragment = memoize(function (stepShortPath, viewPath) {
		var fragment = new FragmentGroup()
		  , defaultStatusName = resolveDefaultStatus(stepShortPath);
		if (!defaultStatusName) return fragment;

		var addSortRecord = getAddRecFrag(null,
			['processingSteps/map/' + resolveStepPath(stepShortPath) + '/isReady']);

		// To be visited (recently pending) business processes (full data)
		fragment.addFragment(getColFragments(getFirstPageItems(reducedStorage,
			'pendingBusinessProcesses/' + viewPath + '/' + defaultStatusName).toArray().slice(0, 10),
			getBusinessProcessData));
		// First page snapshot for each status
		fragment.addFragment(getReducedData('views/pendingBusinessProcesses/' + viewPath));
		// First page list data for each status
		fragment.addFragment(getColFragments(joinSets(
			keys(processingStepsMeta[stepShortPath]).map(function (status) {
				return getFirstPageItems(reducedStorage,
					'pendingBusinessProcesses/' + viewPath + '/' + status);
			})
		), function (businessProcessId) {
			var fragment = new FragmentGroup();
			fragment.addFragment(getBusinessProcessOfficialListFragment(businessProcessId));
			return addSortRecord(businessProcessId, fragment);
		}));
		return fragment;
	}, { primitive: true });

	// Dispatcher resolvers
	var getBusinessProcessDispatcherListFragment = getPartFragments(null, (function (props) {
		var set = new Set(props);
		if (!assignableProcessingSteps) return set;
		assignableProcessingSteps.forEach(function (stepShortPath) {
			set.add('processingSteps/map/' + resolveStepPath(stepShortPath) + '/assignee');
		});
		return set;
	}(businessProcessListProperties)));
	var getDispatcherFragment = memoize(function () {
		var fragment = new FragmentGroup();

		if (assignableProcessingSteps) {
			assignableProcessingSteps.forEach(function (stepShortPath) {
				var defaultStatusName = resolveDefaultStatus(stepShortPath), roleName, getOfficialFragment;
				if (!defaultStatusName) return;
				// First page snapshot
				fragment.addFragment(getReducedData('views/pendingBusinessProcesses/' + stepShortPath +
					'/' + defaultStatusName));
				// First page list data
				fragment.addFragment(getColFragments(getFirstPageItems(reducedStorage,
					'pendingBusinessProcesses/' + stepShortPath + '/' + defaultStatusName),
					getBusinessProcessDispatcherListFragment));
				// Officials
				// TODO: Support deep processing steps
				roleName = 'official' + capitalize.call(stepShortPath);
				getOfficialFragment = getPartFragments(null, new Set(['fullName', 'roles*' + roleName]));
				fragment.promise =
					getDbSet(userStorage, 'direct', 'roles', serializeValue(roleName))(function (set) {
						fragment.addFragment(getColFragments(set, getOfficialFragment));
					});
			});
		}
		return fragment;
	});

	// Supervisor resolvers
	var getBusinessProcessSupervisorListFragment = getPartFragments(null, (function () {
		var set = new Set(['businessName']);
		forEach(processingStepsMeta, function (data, stepShortPath) {
			set.add('processingSteps/map/' + resolveStepPath(stepShortPath) + '/status');
		});
		return set;
	}()));
	var getSupervisorFragment = memoize(function () {
		var fragment = new FragmentGroup();
		// "All roles" first page snapshot
		fragment.addFragment(getReducedData('views/supervisor/all'));
		fragment.addFragment(getColFragments(getFirstPageItems(reducedStorage, 'supervisor/all'),
			getBusinessProcessSupervisorListFragment));

		// Per role first page snapshots
		forEach(processingStepsMeta, function (data, stepShortPath) {
			var defaultStatusName = resolveDefaultStatus(stepShortPath);
			if (!defaultStatusName) return;
			// First page snapshot
			fragment.addFragment(getReducedData('views/pendingBusinessProcesses/' + stepShortPath + '/' +
				defaultStatusName));
			// First page list data
			fragment.addFragment(getColFragments(getFirstPageItems(reducedStorage,
				'pendingBusinessProcesses/' + stepShortPath + '/' + defaultStatusName),
				getBusinessProcessSupervisorListFragment));
		});
		return fragment;
	});

	getAccessRules = memoize(function (appId) {
		var userId, roleName, stepShortPath, custom, fragment, initialBusinessProcesses, promise
		  , clientId, businessProcessId;

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
		if (globalFragment && (roleName !== 'memoryDb')) fragment.addFragment(globalFragment);

		if ((roleName === 'user') || (roleName === 'memoryDb')) {
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
		if (roleName === 'manager') {
			if (custom === 'registration') return fragment;

			if (!custom) {
				// Directly created users
				fragment.promise =
					getDbSet(userStorage, 'direct', 'manager', '7' + userId)(function (users) {
						fragment.addFragment(getColFragments(users, getManagerUserData));
					});
				// Business processes
				fragment.promise = getBusinessProcessStorages(function (storages) {
					return getDbSet(storages, 'direct', 'manager', '7' + userId)(function (bps) {
						fragment.addFragment(getColFragments(bps, getManagerBusinessProcessData));
						// Users that come out of business processes
						fragment.addFragment(getColFragments(mapDbSet(bps, function (bpId) {
							var userId, query = { keyPath: 'initialBusinessProcesses' };
							return userStorage.search(query, function (id, data, stream) {
								if ((data.value === '11') && endsWith.call(id, '*7' + bpId)) {
									userId = id.split('/', 1)[0];
									stream.destroy();
								}
							})(function () { return userId; });
						}), getManagerUserData));
					});
				});
				return fragment;
			}
			clientId = custom;
			businessProcessId = appId[3];
			fragment.addFragment(getManagerUserData(clientId));
			if (businessProcessId) {
				fragment.addFragment(getBusinessProcessData(businessProcessId));
			} else {
				fragment.promise = getBusinessProcessStorages(function (storages) {
					return getDbSet(storages, 'direct', 'manager', '7' + userId)(function (managerBps) {
						var clientBps = getDbRecordSet(userStorage, clientId + '/initialBusinessProcesses')
						  , promise = clientBps.promise;
						clientBps = clientBps.map(function (value) { return value.slice(1); });
						fragment.addFragment(getColFragments(managerBps.and(clientBps),
							getBusinessProcessData));
						return promise;
					});
				});
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
		if (roleName === 'managerValidation') {
			// Recently visited users (full data)
			fragment.addFragment(getRecentlyVisitedManagerValidationUsersFragment(userId));
			// Users Admin specific data
			fragment.addFragment(getManagerValidationFragment());
			return fragment;
		}
		if (roleName === 'metaAdmin') {
			if (getMetaAdminFragment) fragment.addFragment(getMetaAdminFragment());
			return fragment;
		}

		if (isOfficialRoleName(roleName)) {
			stepShortPath = uncapitalize.call(roleName.slice('official'.length));
			// Recently visited business processes (full data)
			fragment.addFragment(getRecentlyVisitedBusinessProcessesFragment(userId, stepShortPath));
			// Official role specific data
			if (assignableProcessingSteps && assignableProcessingSteps.has(stepShortPath)) {
				fragment.addFragment(getOfficialFragment(stepShortPath,
					'assigned/7' + userId + '/' + stepShortPath));
			} else {
				fragment.addFragment(getOfficialFragment(stepShortPath, stepShortPath));
			}
			return fragment;
		}

		if (roleName === 'dispatcher') {
			// Recently visited business processes (full data)
			fragment.addFragment(getRecentlyVisitedBusinessProcessesFragment(userId, 'dispatcher'));
			if (!assignableProcessingSteps) {
				console.error("\n\nError: Missing assignableProcessingSteps setting for dispatcher");
				return fragment;
			}
			// Assignable roles data
			fragment.addFragment(getDispatcherFragment());
			return fragment;
		}

		if (roleName === 'supervisor') {
			// Recently visited business processes (full data)
			fragment.addFragment(getRecentlyVisitedBusinessProcessesFragment(userId, 'supervisor'));
			// Supervisor specific data
			fragment.addFragment(getSupervisorFragment());
			return fragment;
		}
		console.error("\n\nError: Unrecognized role " + roleName + "\n\n");
		return fragment;
	}, { primitive: true });
	return getAccessRules;
};
exports.getDefaultOfficialStepsResolver = getDefaultOfficialStepsResolver;
