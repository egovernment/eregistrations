// Returns fragment that emits all data from provided storage

'use strict';

var memoize       = require('memoizee')
  , Fragment      = require('data-fragment')
  , ensureStorage = require('dbjs-persistence/ensure-storage');

module.exports = memoize(function (storage) {
	ensureStorage(storage);
	var fragment = new Fragment();
	fragment.promise = storage.getAll()(function (data) {
		data.forEach(function (data) { fragment.update(data.id, data.data); });
	});
	storage.on('update', function (event) { fragment.update(event.id, event.data); });
	return fragment;
}, { primitive: true });
