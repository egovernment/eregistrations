// Returns fragment generator, where each returned fragment emits selected indexed data for
// specified object

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , escape         = require('es5-ext/reg-exp/escape')
  , memoize        = require('memoizee')
  , Fragment       = require('data-fragment')
  , assimilateEvent = require('./lib/assimilate-driver-event')

  , driver = require('mano').dbDriver;

var getKeyPathFilter = function (keyPath) {
	var matches = RegExp.prototype.test.bind(new RegExp('^[a-z0-9][a-z0-9A-Z]*/' +
		escape(keyPath) + '(?:/.+|$)'));
	return function (data) { return matches(data.id); };
};

module.exports = memoize(function (dbName) {
	dbName = ensureString(dbName);
	return memoize(function (ownerId/*, options*/) {
		var fragment, options = Object(arguments[2]), filter, index, customFilter, keyPathFilter;

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
		fragment.promise = driver.getReducedObject(ownerId)(function (data) {
			data.forEach(function (data) {
				if (!filter || filter(data)) assimilateEvent(fragment, data.id, data.data);
			});
		});
		driver.on('owner:' + ownerId, function (event) {
			if (event.type !== 'reduced') return;
			if (!filter || filter(event)) assimilateEvent(fragment, event.id, event.data);
		});
		return fragment;
	}, { primitive: true });
}, { primitive: true });
