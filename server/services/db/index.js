'use strict';

var aFrom            = require('es5-ext/array/from')
  , toArray          = require('es5-ext/object/to-array')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , ensureObject     = require('es5-ext/object/valid-object')
  , ensureIterable   = require('es5-ext/iterable/validate-object')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , Set              = require('es6-set')
  , deferred         = require('deferred')
  , once             = require('timers-ext/once')
  , debug            = require('debug-ext')('db-process')
  , FragmentGroup    = require('data-fragment/group')
  , registerReceiver = require('dbjs-persistence/receiver')
  , registerEmitter  = require('dbjs-persistence/lib/emitter')
  , resolve          = require('path').resolve
  , fork             = require('child_process').fork
  , mano             = require('mano')
  , ensureOwnerId    = require('../../../utils/ensure-object-id')
  , getDriver        = require('./local/master')
  , getDriverGlobal  = require('./global/master')

  , stringify = JSON.stringify
  , byStamp = function (a, b) { return this[a].stamp - this[b].stamp; };

module.exports = function (root, data) {
	var getFragment, driver, driverGlobal, emitter, def, userStorage, storageNamesGlobal
	  , getInitialFragment, registerSlaveProcess;

	root = ensureString(root);

	ensureObject(data);
	getFragment = ensureCallable(data.getMemoryUserFragment);
	if (data.getMemoryInitialFragment != null) {
		getInitialFragment = ensureCallable(data.getMemoryInitialFragment);
	}
	if (data.storageNamesGlobal != null) {
		storageNamesGlobal = new Set(aFrom(ensureIterable(data.storageNamesGlobal), ensureString));
	}
	if (data.registerSlaveProcess != null) {
		registerSlaveProcess = ensureCallable(data.registerSlaveProcess);
	}

	// Initialize master driver
	driver = getDriver(root, ensureIterable(data.storageNames), data.dbDriverConf);
	userStorage = driver.getStorage('user');
	if (storageNamesGlobal) driverGlobal = getDriverGlobal(root, storageNamesGlobal);

	// Initialize db-memory process
	emitter = fork(resolve(root, 'server/processes/memory-db'));
	process.on('exit', function () { emitter.kill(); });
	emitter.on('exit', function () { process.kill(); });

	var getAddRecords = require('../../data-fragments/get-add-records-to-fragment');

	def = deferred();
	emitter.once('message', function (message) {
		var emitAccess, accessFragment, emitDeleted, deletedPending, registerDeferreds = [], lastPromise
		  , addPassword = getAddRecords(userStorage, new Set(['password']))
		  , done = Object.create(null), pendingIds;

		if (message.type !== 'init') {
			console.log(message);
			throw new Error("Unrecognized emitter message");
		}

		// Pair master and db-memory process
		registerReceiver(function (driverName, storageName) {
			if (driverName === 'local') return driver.getStorage(storageName);
			if (!driverGlobal || (driverName !== 'global')) {
				throw new Error("Record directed to unknown driver " + stringify(driverName));
			}
			return driverGlobal.getStorage(storageName);
		}, emitter);
		emitter.send({ type: 'continue' });
		emitAccess = registerEmitter('dbAccessData', emitter);
		mano.emitPostRequest = registerEmitter('postRequest', emitter);

		// Configure db data propagation (to memory process) means
		mano.slaveAccessFragment = accessFragment = new FragmentGroup();
		mano.registerUserAccess = function (userId) {
			var fragment, def, promise;
			userId = ensureOwnerId(userId);
			if (done[userId]) return mano.registerUserPromise;
			done[userId] = true;
			debug("register data for %s", userId);
			fragment = getFragment(userId);
			if (!fragment.promise || fragment.promise.resolved) fragment.flush();
			accessFragment.addFragment(fragment);
			addPassword(userId, accessFragment);
			registerDeferreds.push(def = deferred());
			promise = def.promise;
			if (!accessFragment.promise || accessFragment.promise.resolved) {
				accessFragment.flush();
				while ((def = registerDeferreds.shift())) def.resolve();
			} else {
				accessFragment.promise.done(function () {
					while ((def = registerDeferreds.shift())) def.resolve();
				});
			}
			if (lastPromise && !lastPromise.resolved) lastPromise = lastPromise(promise);
			else lastPromise = promise;
			mano.registerUserPromise = lastPromise;
			return promise;
		};

		var resolveUserAccess = require('mano/lib/server/resolve-user-access');

		// Ensures computed data for user is resolved as expected
		var ensureAccess = once(function () {
			var ids = pendingIds;
			pendingIds = null;
			resolveUserAccess(ids).done();
		});

		accessFragment.on('update', function (data) {
			var promise;
			data = toArray(data.updated, function (data, id) {
				return { id: id, data: data };
			}, null, byStamp);
			debug("propagate records [%s]", data.length);
			promise = emitAccess(data);
			while ((def = registerDeferreds.shift())) def.resolve(promise);
			mano.registerUserPromise = promise;
		});
		if (getInitialFragment) accessFragment.addFragment(getInitialFragment());

		// Emits events of deletes to slave process
		emitDeleted = once(function () {
			var batch = deletedPending;
			deletedPending = null;
			deferred(lastPromise).done(function () { emitAccess(batch).done(); });
		});

		driver.on('update', function (event) {
			var ownerId = event.id.split('/', 1)[0];
			if ((ownerId === event.id) && (event.data.value === '7User#')) {
				driver.onDrain.done(function () { mano.registerUserAccess(ownerId).done(); });
				return;
			}
			if (!pendingIds) {
				pendingIds = new Set();
				ensureAccess();
			}
			pendingIds.add(ownerId);

			if (event.data.value) return;
			if (!deletedPending) {
				deletedPending = [];
				emitDeleted();
			}
			deletedPending.push({ id: event.id, data: event.data });
		});

		if (registerSlaveProcess) registerSlaveProcess(emitter);

		def.resolve();
	});
	return def.promise;
};
