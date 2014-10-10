'use strict';

var validValue        = require('es5-ext/object/valid-value')
  , Fragment          = require('dbjs-fragment')
  , getObjectFragment = require('./get-object-fragment');

module.exports = function (set, rules, fragment) {
	var onAdd, onDelete;

	validValue(rules);
	if (!fragment) fragment = new Fragment();

	set.forEach(onAdd = function (obj) {
		fragment.sets.add(getObjectFragment(obj, rules));
	});
	onDelete = function (obj) { fragment.sets.delete(getObjectFragment(obj, rules)); };

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
