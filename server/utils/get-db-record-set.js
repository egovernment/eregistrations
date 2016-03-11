// Returns resolved reactive set of values for given 'direct' property

// So e.g. we may have reactive set of initialBusinessProcesses for specified user

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , memoize       = require('memoizee')
  , ObservableSet = require('observable-set/primitive')
  , ensureStorage = require('dbjs-persistence/ensure-storage')

  , isDigit = RegExp.prototype.test.bind(/[0-9]/);

module.exports = memoize(function (storage, id) {
	var set, handleEvent;
	ensureStorage(storage);
	id = ensureString(id);
	set = new ObservableSet();
	storage.on('keyid:' + id, handleEvent = function (event) {
		var key = event.id.slice(id.length + 1);
		if (!key) return;
		if (!isDigit(key[0])) key = '3' + key;
		if (event.data.value === '11') set.add(key);
		else set.delete(key);
	});
	set.promise = storage.getObjectKeyPath(id).map(handleEvent)(set);
	return set;
}, { primitive: true });
