// Returns fragment generator, where each returned fragment emits selected indexed data for
// specified object

'use strict';

var includes        = require('es5-ext/array/#/contains')
  , aFrom           = require('es5-ext/array/from')
  , deferred        = require('deferred')
  , ensureSet       = require('es6-set/valid-set')
  , ensureDriver    = require('dbjs-persistence/ensure')
  , Fragment        = require('data-fragment')
  , assimilateEvent = require('./lib/assimilate-driver-event');

module.exports = function (driver, keyPaths) {
	var fragments = Object.create(null);

	ensureDriver(driver);
	keyPaths = aFrom(ensureSet(keyPaths));

	return function (objId) {
		var fragment = fragments[objId];
		if (fragment) return fragment;
		fragment = fragments[objId] = new Fragment();
		fragment.promise = driver.getValue(objId)(function (data) {
			if (data) fragment.update(objId, data);
			return deferred.map(keyPaths, function (keyPath) {
				return driver.getIndexedValue(objId, keyPath)(function (data) {
					if (data) assimilateEvent(fragment, objId + '/' + keyPath, data);
				});
			});
		});
		driver.on('object:' + objId, function (event) {
			if (includes.call(keyPaths, event.keyPath)) {
				assimilateEvent(fragment, objId + '/' + event.keyPath, event.data);
			}
		});
		return fragment;
	};
};
