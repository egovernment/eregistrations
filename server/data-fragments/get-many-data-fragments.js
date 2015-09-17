// Returns group fragment which contains all data fragments for objects found in provided
// collection

'use strict';

var ensureCallable       = require('es5-ext/object/valid-callable')
  , ensureIterable       = require('es5-ext/iterable/validate-object')
  , ensureObservable     = require('observable-value/valid-observable')
  , Set                  = require('es6-set/primitive')
  , DataFragmentGroup    = require('data-fragment/group')
  , getFullDataFragments = require('./get-full-data-fragments')
  , db                   = require('mano').db;

module.exports = function (collection/*, getFragment*/) {
	var getFragment = arguments[1], fragment, current;

	ensureObservable(ensureIterable(collection));
	if (getFragment != null) getFragment = getFullDataFragments(db.Object);
	else ensureCallable(getFragment);

	fragment = new DataFragmentGroup();
	current = new Set();

	collection.forEach(function (object) {
		var id = object.__id__;
		fragment.addFragment(getFragment(id));
		current.add(object);
	});
	collection.on('change', function (event) {
		current.forEach(function (object) {
			if (collection.has(object)) return;
			fragment.deleteFragment(getFragment(object.__id__));
			current.delete(object);
		});
		collection.forEach(function (object) {
			if (current.has(object)) return;
			fragment.addFragment(getFragment(object.__id__));
			current.add(object);
		});
	});
	return fragment;
};
