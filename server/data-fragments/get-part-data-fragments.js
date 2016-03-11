// Returns fragment generator, where each returned fragment emits selected data for specified object

'use strict';

var aFrom          = require('es5-ext/array/from')
  , ensureIterable = require('es5-ext/iterable/validate-object')
  , Set            = require('es6-set')
  , ensureType     = require('dbjs/valid-dbjs-type')
  , serialize      = require('dbjs/_setup/serialize/value')
  , Fragment       = require('data-fragment')
  , getEvents      = require('../../utils/dbjs-get-path-events');

module.exports = function (Type, paths) {
	var fragments = Object.create(null);

	ensureType(Type);
	paths = new Set(aFrom(ensureIterable(paths)));

	return function (id) {
		var fragment = fragments[id], object, event;
		if (fragment) return fragment;
		object = Type.getById(id);
		fragment = fragments[id] = new Fragment();
		if (!object) return fragment;
		event = object._lastOwnEvent_;
		if (event) fragment.update(id, { value: serialize(event.value), stamp: event.stamp });
		paths.forEach(function (path) {
			getEvents(object, path).forEach(function (event) {
				fragment.update(event.object.__valueId__,
					{ value: serialize(event.value), stamp: event.stamp });
			});
		});
		object.on('update', function (event) {
			var id = event.object.__valueId__, path = id.slice(object.__id__.length + 1);
			if (event.object._kind_ === 'item') {
				path = path.slice(0, -(event.object._sKey_.length + 1));
			}
			if (!paths.has(path)) return;
			fragment.update(id, { value: serialize(event.value), stamp: event.stamp });
		});
		return fragment.flush();
	};
};
