// Returns fragment of specified records

'use strict';

var aFrom          = require('es5-ext/array/from')
  , uniq           = require('es5-ext/array/#/uniq')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable = require('es5-ext/iterable/validate-object')
  , Set            = require('es6-set')
  , deferred       = require('deferred')
  , memoize        = require('memoizee')
  , Fragment       = require('data-fragment')
  , ensureStorage  = require('dbjs-persistence/ensure-storage');

module.exports = memoize(function (storage, ids) {
	var idsSet = new Set(ids)
	  , fragment = new Fragment();

	fragment.promise = deferred.map(ids, function (id) {
		return storage.getObjectKeyPath(id)(function (records) {
			records.forEach(function (record) { fragment.update(record.id, record.data); });
		});
	});
	storage.on('update', function (event) {
		if (idsSet.has(event.ownerId + (event.keyPath ? ('/' + event.keyPath) : ''))) {
			event.update(event.id, event.data);
		}
	});
	return fragment;
}, { primitive: true, resolvers: [ensureStorage, function (ids) {
	return uniq.call(aFrom(ensureIterable(ids)).map(ensureString)).sort();
}] });
