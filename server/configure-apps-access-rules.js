// Data access/propagation rules for apps

'use strict';

var aFrom                = require('es5-ext/array/from')
  , ensureIterable       = require('es5-ext/iterable/validate-object')
  , findKey              = require('es5-ext/object/find-key')
  , forEach              = require('es5-ext/object/for-each')
  , ensureCallable       = require('es5-ext/object/valid-callable')
  , ensureObject         = require('es5-ext/object/valid-object')
  , ensureString         = require('es5-ext/object/validate-stringifiable-value')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , endsWith             = require('es5-ext/string/#/ends-with')
  , uncapitalize         = require('es5-ext/string/#/uncapitalize')
  , memoize              = require('memoizee')
  , Set                  = require('es6-set')
  , deferred             = require('deferred')
  , debug                = require('debug-ext')('data-access')
  , ensureDatabase       = require('dbjs/valid-dbjs')
  , unserializeValue     = require('dbjs/_setup/unserialize/value')
  , serializeValue       = require('dbjs/_setup/serialize/value')
  , ObservableSet        = require('observable-set')
  , ObservableMulti      = require('observable-multi-set')
  , Fragment             = require('data-fragment')
  , ensureFragment       = require('data-fragment/ensure')
  , FragmentGroup        = require('data-fragment/group')
  , ensureDriver         = require('dbjs-persistence/ensure-driver')
  , unserializeView      = require('../utils/db-view/unserialize-ids')
  , resolveStepPath      = require('../utils/resolve-processing-step-full-path')
  , isOfficialRoleName   = require('../utils/is-official-role-name')
  , supervisorFilter     = require('../utils/filter-supervisor-steps-map')
  , getReducedFrag       = require('./data-fragments/get-reduced-object-fragments')
  , getRedRecFrag        = require('./data-fragments/get-reduced-records-fragment')
  , getAddRecFrag        = require('./data-fragments/get-add-records-to-fragment')
  , getObjFragment       = require('./data-fragments/get-direct-object-fragments')
  , getColFragments      = require('./data-fragments/get-collection-fragments')
  , getPartFragments     = require('./data-fragments/get-part-object-fragments')
  , getDbRecordSet       = require('./utils/get-db-record-set')
  , getDbSet             = require('./utils/get-db-set')
  , mapDbSet             = require('./utils/map-db-set')
  , getOfficialsFragment = require('./utils/get-officials-fragment')
  , defaultUserListProps = require('../apps/users-admin/user-list-properties')

  , create = Object.create, keys = Object.keys, stringify = JSON.stringify
  , emptyFragment = new Fragment();

var managerValidationUserListProps = require('../apps/manager-validation/user-list-properties');

var joinSets = function (sets) {
	var set = new ObservableMulti(sets);
	set.promise = deferred.map(sets, function (set) { return set.promise; });
	return set;
};
var getDefaultOfficialViewsResolver = function (userStorage) {
	return function (userId) {
		var rolesSet = getDbRecordSet(userStorage, userId + '/roles');
		var resultSet = rolesSet.map(unserializeValue).filter(isOfficialRoleName)
			.map(function (roleName) { return uncapitalize.call(roleName.slice('official'.length)); });
		resultSet.promise = rolesSet.promise;
		return resultSet;
	};
};

var defaultResolveOfficialViewPath = function (userId, roleName, stepShortPath, custom) {
	return stepShortPath;
};

module.exports = exports = function (db, dbDriver, data) {
	var userStorage = ensureDriver(dbDriver).getStorage('user')
	  , getBusinessProcessData = getObjFragment()
	  , reducedStorage = dbDriver.getReducedStorage()
	  , getUserData = getObjFragment()
	  , getUserReducedData = getReducedFrag(userStorage)
	  , getReducedData = getReducedFrag(reducedStorage)
	  , getBusinessProcessFullData
	  , resolveOfficialViews, processingStepsMeta, processingStepsDefaultMap = create(null)
	  , businessProcessListProperties, businessProcessMyAccountProperties
	  , globalFragment, getMetaAdminFragment, getAccessRules
	  , assignableProcessingSteps, initializeView, resolveOfficialViewPath, userListProps
	  , businessProcessDispatcherListExtraProperties = [], officialDispatcherListExtraProperties = []
	  , businessProcessMyAccountExtraProperties = [], businessProcessSupervisorExtraProperties = []
	  , businessProcessAppGlobalFragment;

	ensureDatabase(db);

	var getBusinessProcessStorages = require('./utils/business-process-storages');
	var getManagerUserData = getPartFragments(userStorage, new Set(['email', 'firstName',
		'initialBusinessProcesses', 'lastName', 'manager', 'canManagedUserBeDestroyed',
		'isActiveAccount', 'isInvitationSent']));
	var getManagerBusinessProcessData = getPartFragments(null, new Set(['businessName',
		'isSentBack', 'isUserProcessing', 'isSubmitted', 'manager', 'status']));
	var addCustomBusinessProcessData;
	var businessProcessUserMap = require('mano/lib/server/business-process-user-map');

	ensureObject(data);
	processingStepsMeta          = ensureObject(data.processingStepsMeta);
	addCustomBusinessProcessData = data.addCustomBusinessProcessData &&
		ensureCallable(data.addCustomBusinessProcessData);

	if (addCustomBusinessProcessData) {
		getBusinessProcessFullData = function (businessProcessId) {
			var fragment = new FragmentGroup();

			fragment.addFragment(getBusinessProcessData(businessProcessId));
			addCustomBusinessProcessData(businessProcessId, fragment);

			return fragment;
		};
	} else {
		getBusinessProcessFullData = getBusinessProcessData;
	}

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
	if (data.userListProps) {
		userListProps = new Set(aFrom(ensureIterable(data.userListProps)));
	} else {
		userListProps = defaultUserListProps;
	}
	if (data.businessProcessAppGlobalFragment) {
		businessProcessAppGlobalFragment = data.businessProcessAppGlobalFragment;
	}

	businessProcessListProperties =
		new Set(aFrom(ensureIterable(data.businessProcessListProperties)));

	if (data.businessProcessDispatcherListExtraProperties) {
		businessProcessDispatcherListExtraProperties =
			aFrom(ensureIterable(data.businessProcessDispatcherListExtraProperties));
	}
	if (data.officialDispatcherListExtraProperties) {
		officialDispatcherListExtraProperties =
			aFrom(ensureIterable(data.officialDispatcherListExtraProperties));
	}
	if (data.businessProcessMyAccountExtraProperties) {
		businessProcessMyAccountExtraProperties =
			aFrom(ensureIterable(data.businessProcessMyAccountExtraProperties));
	}
	if (data.businessProcessSupervisorExtraProperties) {
		businessProcessSupervisorExtraProperties =
			aFrom(ensureIterable(data.businessProcessSupervisorExtraProperties));
	}

	businessProcessMyAccountProperties =
		new Set(aFrom(ensureIterable(data.businessProcessListProperties))
			.concat(['certificates/dataSnapshot/jsonString', 'dataForms/dataSnapshot/jsonString',
				'isSentBack', 'isUserProcessing',
				'paymentReceiptUploads/dataSnapshot/jsonString',
				'requirementUploads/dataSnapshot/jsonString', 'status'])
			.concat(businessProcessMyAccountExtraProperties));

	initializeView = ensureCallable(data.initializeView);

	if (data.resolveOfficialViewPath != null) {
		resolveOfficialViewPath = ensureCallable(data.resolveOfficialViewPath);
	} else {
		resolveOfficialViewPath = defaultResolveOfficialViewPath;
	}

	// Configure official steps (per user) resolver
	if (data.officialViewsResolver != null) {
		resolveOfficialViews = ensureCallable(data.officialViewsResolver);
	} else {
		resolveOfficialViews = getDefaultOfficialViewsResolver(userStorage);
	}
	resolveOfficialViews = memoize(resolveOfficialViews, { length: 1, primitive: true });

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

	var officialsFragment = getOfficialsFragment(db, userStorage, { keyPaths: ['fullName'] });

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
	var addOfficialViewsPendingSizes = (function () {
		var resolveFragment = function (viewPaths, userId) {
			var ids, viewNames, fragment;
			if (!viewPaths.size) return emptyFragment;
			ids = [];
			viewNames = [];
			viewPaths.forEach(function (stepShortPath) {
				var viewName;
				if (assignableProcessingSteps && assignableProcessingSteps.has(stepShortPath)) {
					viewName = 'businessProcesses/assigned/7' + userId + '/' + stepShortPath;
				} else {
					viewName = 'businessProcesses/' + stepShortPath;
				}
				viewNames.push(viewName);
				ids.push('views/' + viewName + '/pending/totalSize');
			});
			fragment = getRedRecFrag(reducedStorage, ids);
			fragment.promise = fragment.promise(deferred.map(viewNames, initializeView));
			return fragment;
		};
		return function (userId, fragment) {
			var viewPaths = resolveOfficialViews(userId)
			  , current;
			current = resolveFragment(viewPaths, userId);
			fragment.addFragment(current);
			viewPaths.on('change', function () {
				var nu = resolveFragment(viewPaths, userId);
				if (nu === current) return;
				fragment.addFragment(nu);
				fragment.deleteFragment(current);
				current = nu;
			});
		};
	}());

	// MyAccount resolvers
	var getBusinessProcessMyAccountFragment =
		getPartFragments(null, businessProcessMyAccountProperties);

	// Users Admin resolvers
	var getUserListFragment = getPartFragments(userStorage, userListProps);
	var getRecentlyVisitedUsersFragment = function (userId) {
		var list = getDbRecordSet(userStorage, userId + '/recentlyVisited/users')
			.map(function (value) { return value.slice(1); });

		return getColFragments(list, getUserFragment);
	};
	var getUsersAdminFragment = memoize(function () {
		var fragment = new FragmentGroup();
		fragment.promise = initializeView('usersAdmin')(function () {
			// First page snapshot
			fragment.addFragment(getUserReducedData('views/usersAdmin'));
			// First page list data
			fragment.addFragment(getColFragments(getFirstPageItems(userStorage, 'usersAdmin'),
				getUserListFragment));
		});
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
		fragment.promise = initializeView('managerValidation')(function () {
			// First page snapshot
			fragment.addFragment(getUserReducedData('views/managerValidation'));
			// First page list data
			fragment.addFragment(getColFragments(getFirstPageItems(userStorage, 'managerValidation'),
				getManagerValidationUserListFragment));
		});
		return fragment;
	});

	// Official roles resolvers
	var getRecentlyVisitedBusinessProcessesFragment = function (userId, stepShortPath) {
		var list = getDbRecordSet(userStorage,
			userId + '/recentlyVisited/businessProcesses/' + stepShortPath)
			.map(function (value) { return value.slice(1); });

		return getColFragments(list, getBusinessProcessFullData);
	};
	var getBusinessProcessOfficialListFragment =
		getPartFragments(null, businessProcessListProperties);

	var getOfficialFragment = memoize(function (stepShortPath, viewPath) {
		var fragment = new FragmentGroup()
		  , defaultStatusName = resolveDefaultStatus(stepShortPath);
		if (!defaultStatusName) return fragment;

		var addSortRecord = getAddRecFrag(null,
			['processingSteps/map/' + resolveStepPath(stepShortPath) + '/isReady']);

		debug('%s/%s init', stepShortPath, viewPath);
		fragment.addFragment(officialsFragment);
		fragment.promise = initializeView('businessProcesses/' + viewPath)(function () {
			var items = getFirstPageItems(reducedStorage,
				'businessProcesses/' + viewPath + '/' + defaultStatusName).toArray().slice(0, 5);
			debug('%s/%s init pending items %s', stepShortPath, viewPath, items.length);
			items.on('change', function () {
				debug('%s/%s changed pending items %s', stepShortPath, viewPath, items.length);
			});
			// To be visited (recently pending) business processes (full data)
			fragment.addFragment(getColFragments(items, function (bpId) {
				debug('%s/%s retrieve item fragment %s', stepShortPath, viewPath, bpId);
				return getBusinessProcessFullData(bpId);
			}));
			// First page snapshot for each status
			fragment.addFragment(getReducedData('views/businessProcesses/' + viewPath));
			// First page list data for each status
			fragment.addFragment(getColFragments(joinSets(
				keys(processingStepsMeta[stepShortPath]).map(function (status) {
					return getFirstPageItems(reducedStorage,
						'businessProcesses/' + viewPath + '/' + status);
				})
			), function (businessProcessId) {
				var fragment = new FragmentGroup();
				fragment.addFragment(getBusinessProcessOfficialListFragment(businessProcessId));
				return addSortRecord(businessProcessId, fragment);
			}));
		});
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
	}(aFrom(businessProcessListProperties).concat(businessProcessDispatcherListExtraProperties))));
	var getDispatcherFragment = memoize(function () {
		var fragment = new FragmentGroup();

		fragment.addFragment(officialsFragment);
		if (assignableProcessingSteps) {
			assignableProcessingSteps.forEach(function (stepShortPath) {
				var defaultStatusName = resolveDefaultStatus(stepShortPath), roleName, getOfficialFragment;
				if (!defaultStatusName) return;
				fragment.promise = initializeView('businessProcesses/' + stepShortPath)(function () {
					// First page snapshot
					fragment.addFragment(getReducedData('views/businessProcesses/' + stepShortPath +
						'/' + defaultStatusName));
					// First page list data
					fragment.addFragment(getColFragments(getFirstPageItems(reducedStorage,
						'businessProcesses/' + stepShortPath + '/' + defaultStatusName),
						getBusinessProcessDispatcherListFragment));
				});
				// Officials
				// TODO: Support deep processing steps
				roleName = 'official' + capitalize.call(stepShortPath);
				getOfficialFragment = getPartFragments(null, new Set(['fullName', 'roles*' + roleName]
					.concat(officialDispatcherListExtraProperties)));
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
		var set = new Set(['businessName'].concat(businessProcessSupervisorExtraProperties));
		forEach(processingStepsMeta, function (data, stepShortPath) {
			set.add('processingSteps/map/' + resolveStepPath(stepShortPath) + '/status');
			set.add('processingSteps/map/' + resolveStepPath(stepShortPath) + '/assignee');
		});
		return set;
	}()));
	var getSupervisorFragment = memoize(function () {
		var fragment = new FragmentGroup();
		fragment.addFragment(officialsFragment);
		// "All roles" first page snapshot
		fragment.promise = initializeView('supervisor')(function () {
			fragment.addFragment(getReducedData('views/supervisor/all'));
			fragment.addFragment(getColFragments(getFirstPageItems(reducedStorage, 'supervisor/all'),
				getBusinessProcessSupervisorListFragment));
		});

		// Per role first page snapshots
		forEach(supervisorFilter(processingStepsMeta), function (statuses, stepShortPath) {
			forEach(statuses, function (conf, status) {
				fragment.promise = initializeView('businessProcesses/' + stepShortPath)(function () {
					// First page snapshot
					fragment.addFragment(getReducedData('views/businessProcesses/' + stepShortPath +
						'/' + status));
					// First page list data
					fragment.addFragment(getColFragments(getFirstPageItems(reducedStorage,
						'businessProcesses/' + stepShortPath + '/' + status),
						getBusinessProcessSupervisorListFragment));
				});
			});
		});
		return fragment;
	});

	getAccessRules = memoize(function (appId) {
		var userId, roleName, stepShortPath, custom, fragment, initialBusinessProcesses, promise
		  , clientId, businessProcessId, viewPath;

		appId = appId.split('.');
		userId = appId[0];
		roleName = appId[1];
		custom = appId.slice(2).join('.');

		if (!roleName) return emptyFragment; // Temporary inconsistent state (client migration)

		fragment = new FragmentGroup();

		// User profile data
		fragment.addFragment(getUserFragment(userId));
		// Sizes of pending files in official roles of user
		addOfficialViewsPendingSizes(userId, fragment);
		// Eventual global fragment
		if (globalFragment && (roleName !== 'memoryDb')) fragment.addFragment(globalFragment);

		if ((roleName === 'user') || (roleName === 'memoryDb')) {
			if (custom) {
				// Business process application
				// Business process data
				fragment.addFragment(getBusinessProcessFullData(custom));
				if (businessProcessAppGlobalFragment) {
					fragment.addFragment(businessProcessAppGlobalFragment);
				}
			} else {
				initialBusinessProcesses = getDbRecordSet(userStorage,
					userId + '/initialBusinessProcesses');
				promise = initialBusinessProcesses.promise;
				initialBusinessProcesses = initialBusinessProcesses
					.map(function (value) { return value.slice(1); });
				initialBusinessProcesses.promise = promise;
				if (roleName === 'memoryDb') {
					// All businesss processes (full data)
					fragment.addFragment(getColFragments(initialBusinessProcesses, getBusinessProcessData));
				} else {
					// All businesss processes (partial data)
					fragment.addFragment(getColFragments(initialBusinessProcesses,
						getBusinessProcessMyAccountFragment));
				}
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
							return businessProcessUserMap()(function (map) { return map.get('7' + bpId); });
						}), getManagerUserData));
					});
				});
				return fragment;
			}
			clientId = appId[2];
			businessProcessId = appId[3];
			fragment.addFragment(getManagerUserData(clientId));
			if (businessProcessId) {
				fragment.addFragment(getBusinessProcessFullData(businessProcessId));
				if (businessProcessAppGlobalFragment) {
					fragment.addFragment(businessProcessAppGlobalFragment);
				}
			} else {
				fragment.promise = getBusinessProcessStorages(function (storages) {
					return getDbSet(storages, 'direct', 'manager', '7' + userId)(function (managerBps) {
						var clientBps = getDbRecordSet(userStorage, clientId + '/initialBusinessProcesses')
						  , promise = clientBps.promise;
						clientBps = clientBps.map(function (value) { return value.slice(1); });
						fragment.addFragment(getColFragments(managerBps.and(clientBps),
							getBusinessProcessMyAccountFragment));
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
			viewPath = resolveOfficialViewPath(userId, roleName, stepShortPath, custom);
			if (assignableProcessingSteps && assignableProcessingSteps.has(stepShortPath)) {
				fragment.addFragment(getOfficialFragment(stepShortPath,
					'assigned/7' + userId + '/' + viewPath));
			} else {
				fragment.addFragment(getOfficialFragment(stepShortPath, viewPath));
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
exports.getDefaultOfficialViewsResolver = getDefaultOfficialViewsResolver;
