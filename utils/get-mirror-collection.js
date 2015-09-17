// Creates mirror collection of objects in other database
// Needed for e.g. tracking same data in reduced database

'use strict';

var ensureIterable   = require('es5-ext/iterable/validate-object')
  , ensureObservable = require('observable-value/valid-observable')
  , ensureDatabase   = require('dbjs/valid-dbjs')
  , ObservableSet    = require('observable-set');

module.exports = function (collection, db) {
	var objects = [], set
	  , resolveObject = function (object) { return db.Object.getById(object.__id__); }
	  , onAdd = function (object) { set.add(resolveObject(object)); }
	  , onDelete = function (object) { set.delete(resolveObject(object)); };

	ensureObservable(ensureIterable(collection));
	ensureDatabase(db);
	collection.forEach(function (object) { objects.push(resolveObject(object)); });
	set = new ObservableSet(objects);
	objects = null;

	collection.on('change', function (event) {
		if (event.type === 'add') {
			onAdd(event.value);
			return;
		}
		if (event.type === 'delete') {
			onDelete(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.deleted) event.deleted.forEach(onDelete);
			if (event.added) event.added.forEach(onAdd);
			return;
		}
		console.log("Errorneous event:", event);
		throw new TypeError("Unsupported event: " + event.type);
	});
	return set;
};
