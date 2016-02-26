// Returns fragment that emits all data from provided storage

'use strict';

var deferred           = require('deferred')
  , memoize            = require('memoizee')
  , FragmentGroup      = require('data-fragment/group')
  , ensureDriver       = require('dbjs-persistence/ensure-driver')
  , getStorageFragment = require('./get-storage-fragment')

  , keys = Object.keys;

module.exports = memoize(function (driver) {
	var fragment = new FragmentGroup();
	ensureDriver(driver);

	fragment.promise = driver.getStorages()(function (storages) {
		return deferred.map(keys(storages), function (name) {
			return fragment.addFragment(getStorageFragment(storages[name]));
		});
	});

	return fragment;
}, { primitive: true });
