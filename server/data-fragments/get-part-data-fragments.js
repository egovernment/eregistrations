// Returns fragment generator, where each returned fragment emits selected data for specified object

'use strict';

var ensureSet  = require('es6-set/valid-set')
  , ensureType = require('dbjs/valid-dbjs-type')
  , serialize  = require('dbjs/_setup/serialize/value')
  , Fragment   = require('data-fragment')
  , addEvent   = require('./utils/add-event');

module.exports = function (Type, paths) {
	var fragments = Object.create(null);

	ensureType(Type);
	ensureSet(paths);

	return function (id) {
		var fragment = fragments[id], object, event;
		if (fragment) return fragment;
		object = Type.getById(id);
		fragment = fragments[id] = new Fragment();
		if (!object) return fragment;
		event = object._lastOwnEvent_;
		if (event) fragment.update(id, { value: serialize(event.value), stamp: event.stamp });
		paths.forEach(function (path) { addEvent(fragment, object, path); });
		object.on('update', function (event) {
			var id = event.object.__valueId__, path = id.slice(object.__id__.length + 1);
			if (event.object._kind_ === 'item') {
				path = path.slice(0, -(event.object._sKey_.length + 1));
			}
			if (!paths.has(path)) return;
			fragment.update(id, { value: serialize(event.value), stamp: event.stamp });
		});
		return fragment;
	};
};
