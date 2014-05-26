'use strict';

var validValue   = require('es5-ext/object/valid-value')
  , memoize      = require('memoizee/plain')
  , Fragment     = require('dbjs-fragment')
  , objFragment  = require('dbjs-fragment/object-family')

  , getId = function (args) { return args[0].__id__; };

module.exports = function (set, rules, fragment) {
	var getFragment, onAdd, onDelete;

	validValue(rules);
	if (!fragment) fragment = new Fragment();
	getFragment = memoize(function (obj) {
		return objFragment(obj, rules);
	}, { normalizer: getId });

	set.forEach(onAdd = function (obj) {
		fragment.sets.add(getFragment(obj));
	});
	onDelete = function (obj) { fragment.sets.delete(getFragment(obj)); };

	set.on('change', function (event) {
		if (event.type === 'add') {
			onAdd(event.value);
			return;
		}
		if (event.type === 'delete') {
			onDelete(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.added) event.added.forEach(onAdd);
			if (event.deleted) event.deleted.forEach(onDelete);
			return;
		}
		console.log("Errorneous event:", event);
		throw new TypeError("Unsupported event: " + event.type);
	});
	return fragment;
};
