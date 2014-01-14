'use strict';

var memoize      = require('memoizee/lib/primitive')
  , Fragment     = require('dbjs-fragment')
  , objFragment  = require('dbjs-fragment/object-family')

  , getId = function (obj) { return obj.__id__; };

module.exports = function (set, meta, fragment) {
	var getFragment, onAdd;

	if (!fragment) fragment = new Fragment();
	getFragment = memoize(function (obj) {
		return objFragment(obj, meta);
	}, { serialize: getId });

	set.forEach(onAdd = function (obj) {
		fragment.sets.add(getFragment(obj));
	});

	set.on('change', function (event) {
		if (event.type === 'add') {
			onAdd(event.value);
			return;
		}
		if (event.type === 'delete') {
			fragment.sets.delete(getFragment(event.value));
			return;
		}
		throw new TypeError("Unsupported event: " + event.type);
	});
	return fragment;
};
