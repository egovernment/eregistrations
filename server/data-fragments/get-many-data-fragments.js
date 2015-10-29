// Returns group fragment which contains all data fragments for objects found in provided
// collection

'use strict';

var includes             = require('es5-ext/array/#/contains')
  , ensureCallable       = require('es5-ext/object/valid-callable')
  , ensureIterable       = require('es5-ext/iterable/validate-object')
  , ensureObservable     = require('observable-value/valid-observable')
  , Set                  = require('es6-set/primitive')
  , DataFragmentGroup    = require('data-fragment/group')
  , getFullDataFragments = require('./get-full-data-fragments')
  , db                   = require('mano').db

  , isArray = Array.isArray;

module.exports = function (collection/*, getFragment*/) {
	var getFragment = arguments[1], fragment, current, isArrayMode = isArray(collection);

	ensureObservable(ensureIterable(collection));
	if (getFragment == null) getFragment = getFullDataFragments(db.Object);
	else ensureCallable(getFragment);

	fragment = new DataFragmentGroup();
	current = new Set();

	collection.forEach(function (object) {
		var id = object.__id__, objFragment = getFragment(id);
		if (objFragment) fragment.addFragment(objFragment);
		current.add(object);
	});
	collection.on('change', function (event) {
		current.forEach(function (object) {
			var objFragment;
			if (isArrayMode) {
				if (includes.call(collection, object)) return;
			} else {
				if (collection.has(object)) return;
			}
			objFragment = getFragment(object.__id__);
			if (objFragment) fragment.deleteFragment(objFragment);
			current.delete(object);
		});
		collection.forEach(function (object) {
			var objFragment;
			if (current.has(object)) return;
			objFragment = getFragment(object.__id__);
			if (objFragment) fragment.addFragment(objFragment);
			current.add(object);
		});
	});
	return fragment.flush();
};
