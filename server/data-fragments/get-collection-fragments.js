// Returns group fragment which contains all data fragments for objects found in provided
// collection

'use strict';

var includes            = require('es5-ext/array/#/contains')
  , ensureString        = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable      = require('es5-ext/iterable/validate-object')
  , ensureObservable    = require('observable-value/valid-observable')
  , Set                 = require('es6-set')
  , DataFragmentGroup   = require('data-fragment/group')
  , defaultGetFragments = require('./get-direct-object-fragments')

  , isArray = Array.isArray;

module.exports = function (collection, getFragment) {
	var fragment, current, isArrayMode = isArray(collection);

	ensureObservable(ensureIterable(collection));
	if (typeof getFragment !== 'function') {
		getFragment = defaultGetFragments(ensureString(getFragment));
	}

	fragment = new DataFragmentGroup();
	current = new Set();
	if (collection.promise) fragment.promise = collection.promise;

	collection.forEach(function (id) {
		fragment.addFragment(getFragment(id));
		current.add(id);
	});
	collection.on('change', function (event) {
		current.forEach(function (id) {
			if (isArrayMode) {
				if (includes.call(collection, id)) return;
			} else {
				if (collection.has(id)) return;
			}
			fragment.deleteFragment(getFragment(id));
			current.delete(id);
		});
		collection.forEach(function (id) {
			if (current.has(id)) return;
			fragment.addFragment(getFragment(id));
			current.add(id);
		});
	});
	if (!fragment.promise || fragment.promise.resolved) fragment.flush();
	return fragment;
};
