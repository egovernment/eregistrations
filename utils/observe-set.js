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
			if (onAdd) onAdd(event.value, event);
			return;
		}
		if (event.type === 'delete') {
			if (onDelete) onDelete(event.value, event);
			return;
		}
		if (event.type === 'batch') {
			if (event.added) {
				event.added.forEach(function (item) { onAdd(item, event); });
			}
			if (event.deleted) {
				event.deleted.forEach(function (item) { onDelete(item, event); });
			}
			return;
		}
		console.log("Errorneous event:", event);
		throw new Error("Unsupported event: " + event.type);
	});
	return { destroy: function () { set.off('change', listener); } };
};
