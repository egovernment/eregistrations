// Returns observable set of objects for given constraints

'use strict';

var ensureString  = require('es5-ext/object/validate-stringifiable-value')
  , memoize       = require('memoizee')
  , ObservableSet = require('observable-set/primitive')
  , dbDriver      = require('mano').dbDriver

  , isDigit = RegExp.prototype.test.bind(/[0-9]/);

module.exports = memoize(function (dbName, id) {
	var set, handleEvent;
	dbName = ensureString(dbName);
	id = ensureString(id);
	set = new ObservableSet();
	dbDriver.on('keyid:' + id, handleEvent = function (event) {
		var key = event.id.slice(id.length + 1);
		if (!key) return;
		if (!isDigit(key[0])) key = '3' + key;
		if (event.data.value === '11') set.add(key);
		else set.delete(key);
	});
	set.promise = dbDriver.getObjectKeyPath(id).map(handleEvent)(set);
	return set;
}, { primitive: true });
