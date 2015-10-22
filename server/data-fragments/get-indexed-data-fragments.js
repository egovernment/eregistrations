// Returns fragment generator, where each returned fragment emits selected indexed data for
// specified object

'use strict';

var aFrom        = require('es5-ext/array/from')
  , deferred     = require('deferred')
  , ensureSet    = require('es6-set/valid-set')
  , ensureDriver = require('dbjs-persistence/ensure')
  , Fragment     = require('data-fragment')

  , isArray = Array.isArray;

var emitEvent = function (fragment, objId, keyPath, data) {
	if (!isArray(data.value)) {
		fragment.update(objId + '/' + keyPath, data);
		return;
	}
	data.value.forEach(function (data) {
		var key = data.key ? '*' + data.key : '';
		fragment.update(objId + '/' + keyPath + key, data);
	});
};

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
				return driver.indexKeyPath(keyPath)(function (map) {
					if (map[objId]) emitEvent(fragment, objId, keyPath, map[objId]);
				});
			});
		});
		driver.on('object:' + objId, function (event) {
			if (keyPaths.has(event.keyPath)) {
				emitEvent(fragment, objId, event.keyPath, event.data, event.old);
			}
		});
		return fragment;
	};
};
