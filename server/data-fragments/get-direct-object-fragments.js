// Returns fragment that emits direct data for specified object
// Optional filtering of some records is possible via `options.filter`

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , escape         = require('es5-ext/reg-exp/escape')
  , memoize        = require('memoizee')
  , Fragment       = require('data-fragment')

  , driver = require('mano').dbDriver;

var getKeyPathFilter = function (keyPath) {
	var matches = RegExp.prototype.test.bind(new RegExp('^[a-z0-9][a-z0-9A-Z]*/' +
		escape(keyPath) + '(?:/.+|$)'));
	return function (data) { return matches(data.id); };
};

module.exports = memoize(function (dbName) {
	dbName = ensureString(dbName);
	return memoize(function (ownerId/*, options*/) {
		var fragment, options = Object(arguments[1]), filter, index, customFilter, keyPathFilter;

		ownerId = ensureString(ownerId);
		if (options.filter != null) customFilter = ensureCallable(options.filter);
		index = ownerId.indexOf('/');
		if (index !== -1) {
			keyPathFilter = getKeyPathFilter(ownerId.slice(index + 1));
			ownerId = ownerId.slice(0, index);
		}
		if (keyPathFilter) {
			if (customFilter) {
				filter = function (id, data) { return keyPathFilter(id, data) && customFilter(id, data); };
			} else {
				filter = keyPathFilter;
			}
		} else if (customFilter) {
			filter = customFilter;
		}
		fragment = new Fragment();
		fragment.promise = driver.getDirectObject(ownerId)(function (data) {
			data.forEach(function (data) {
				if (!filter || filter(data)) fragment.update(data.id, data.data);
			});
		});
		driver.on('object:' + ownerId, function (event) {
			if (event.type !== 'direct') return;
			if (!filter || filter(event)) fragment.update(event.id, event.data);
		});
		return fragment;
	}, { primitive: true });
}, { primitive: true });
