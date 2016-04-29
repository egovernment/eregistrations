// Service: Limits LRU recentlyVisited lists up to max 10 (configurable) items

'use strict';

var ensureNaturalNumber = require('es5-ext/object/ensure-natural-number-value')
  , startsWith          = require('es5-ext/string/#/starts-with')
  , debug               = require('debug-ext')('recently-visited-limiter')
  , ensureStorage       = require('dbjs-persistence/ensure-storage');

module.exports = function (storage/*, options*/) {
	ensureStorage(storage);
	var options = Object(arguments[1])
	  , limit = (options.limit != null) ? ensureNaturalNumber(options.limit) : 10;
	storage.on('update', function (event) {
		if (!event.keyPath || !startsWith.call(event.keyPath, 'recentlyVisited/')) {
			return; // No recentlyVisited record
		}
		if (event.keyPath === event.path) return; // No multiple item update
		if (event.data.value !== '11') return; // Not expected value
		storage.getObjectKeyPath(event.ownerId + '/' + event.keyPath)(function (events) {
			events = events.filter(function (event) { return (event.data.value === '11'); });
			if (events.length <= limit) return;
			return storage.storeMany(events.slice(0, events.length - limit).map(function (event) {
				return { id: event.id, data: { value: '' } };
			})).aside(function () {
				debug("cleared %s out of %s", events.length - limit, event.ownerId + '/' + event.keyPath);
			});
		}).done();
	});
};
