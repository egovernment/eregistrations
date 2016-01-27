// Returns fragment that emits direct data for specified object
// Optional filtering of some records is possible via `options.filter`

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , escape         = require('es5-ext/reg-exp/escape')
  , memoize        = require('memoizee')
  , Fragment       = require('data-fragment')
  , anyIdToStorage = require('../utils/any-id-to-storage')

  , driver = require('mano').dbDriver;

var getKeyPathFilter = function (keyPath) {
	var matches = RegExp.prototype.test.bind(new RegExp('^[a-z0-9][a-z0-9A-Z]*/' +
		escape(keyPath) + '(?:/.+|$)'));
	return function (data) { return matches(data.id); };
};

module.exports = memoize(function (storageName) {
	var storage;
	if (storageName) storage = driver.getStorage(storageName);
	return memoize(function (ownerId/*, options*/) {
		var fragment, options = Object(arguments[1]), filter, index, customFilter, keyPathFilter
		  , promise, setupListener;

		ownerId = ensureString(ownerId);
		if (options.filter != null) customFilter = ensureCallable(options.filter);
		index = ownerId.indexOf('/');
		if (index !== -1) {
			keyPathFilter = getKeyPathFilter(ownerId.slice(index + 1));
			ownerId = ownerId.slice(0, index);
		}
		if (keyPathFilter) {
			if (customFilter) {
				filter = function (data) { return keyPathFilter(data) && customFilter(data); };
			} else {
				filter = keyPathFilter;
			}
		} else if (customFilter) {
			filter = customFilter;
		}
		fragment = new Fragment();
		setupListener = function (storage) {
			storage.on('owner:' + ownerId, function (event) {
				if (event.type !== 'direct') return;
				if (!filter || filter(event)) fragment.update(event.id, event.data);
			});
		};
		if (storage) {
			promise = storage.getObject(ownerId);
			setupListener(storage);
		} else {
			promise = anyIdToStorage(ownerId)(function (storage) {
				if (!storage) return [];
				setupListener(storage);
				return storage.getObject(ownerId);
			});
		}
		fragment.promise = promise(function (data) {
			data.forEach(function (data) {
				if (!filter || filter(data)) fragment.update(data.id, data.data);
			});
		});
		return fragment;
	}, { primitive: true });
}, { primitive: true, resolvers: [function (storageName) {
	if (storageName == null) return '';
	return ensureString(storageName);
}] });
