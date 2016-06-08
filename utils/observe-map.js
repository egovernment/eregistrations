// Makes observable map observation easier
// Temporary solution until https://github.com/medikoo/observable-map/issues/1
// is solved
//
// map  - Observable map
// conf - Hash with `onSet` and/or `onDelete` listeners, and eventual `iterateExisting: true`
//        instruction that requests to invoke `onSet` with all current items at initialization

'use strict';

var ensureCallable      = require('es5-ext/object/valid-callable')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureObservableMap = require('observable-map/valid-observable-map');

module.exports = function (map, conf) {
	var onSet, onDelete, listener;
	ensureObservableMap(map);
	ensureObject(conf);
	if (conf.onSet) onSet = ensureCallable(conf.onSet);
	if (conf.onDelete) onDelete = ensureCallable(conf.onDelete);
	if (!onSet && !onDelete) throw new Error("Expected at least one listener");
	map.on('change', listener = function (event) {
		if (event.type === 'set') {
			if (onSet) onSet(event.key, event.value);
			if (event.oldValue && onDelete) onDelete(event.key, event.oldValue);
			return;
		}
		if (event.type === 'delete') {
			if (onDelete) onDelete(event.key, event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.set) {
				event.set.forEach(function (value, key) { onSet(key, value); });
			}
			if (event.deleted) {
				event.deleted.forEach(function (value, key) { onDelete(key, value); });
			}
			return;
		}
		console.log("Errorneous event:", event);
		throw new Error("Unsupported event: " + event.type);
	});
	if (onSet && conf.iterateExisting) {
		map.forEach(function (value, key) { onSet(key, value); });
	}
	return { destroy: function () { map.off('change', listener); } };
};
