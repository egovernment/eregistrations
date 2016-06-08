// Makes observable set observation easier
// Temporary solution until https://github.com/medikoo/observable-set/issues/3
// is solved
//
// set  - Observable set
// conf - Hash with `onAdd` and/or `onDelete` listeners, and eventual `iterateExisting: true`
//        instruction that requests to invoke `onAdd` with all current items at initialization

'use strict';

var ensureCallable      = require('es5-ext/object/valid-callable')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureObservableSet = require('observable-set/valid-observable-set');

module.exports = function (set, conf) {
	var onAdd, onDelete, listener;
	ensureObservableSet(set);
	ensureObject(conf);
	if (conf.onAdd) onAdd = ensureCallable(conf.onAdd);
	if (conf.onDelete) onDelete = ensureCallable(conf.onDelete);
	if (!onAdd && !onDelete) throw new Error("Expected at least one listener");
	set.on('change', listener = function (event) {
		if (event.type === 'add') {
			if (onAdd) onAdd(event.value);
			return;
		}
		if (event.type === 'delete') {
			if (onDelete) onDelete(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.added) {
				event.added.forEach(function (item) { onAdd(item); });
			}
			if (event.deleted) {
				event.deleted.forEach(function (item) { onDelete(item); });
			}
			return;
		}
		console.log("Errorneous event:", event);
		throw new Error("Unsupported event: " + event.type);
	});
	if (onAdd && conf.iterateExisting) {
		set.forEach(function (item) { onAdd(item); });
	}
	return { destroy: function () { set.off('change', listener); } };
};
