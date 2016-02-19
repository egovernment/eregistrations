// Returns fragment generator, where each returned fragment emits all data for specified object

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , startsWith     = require('es5-ext/string/#/starts-with')
  , ensureType     = require('dbjs/valid-dbjs-type')
  , serialize      = require('dbjs/_setup/serialize/value')
  , Fragment       = require('data-fragment')
  , db             = require('mano').db;

module.exports = function (Type/*, options*/) {
	var fragments = Object.create(null), options = Object(arguments[1])
	  , filter;

	if (Type != null) ensureType(Type);
	if (options.filter != null) filter = ensureCallable(options.filter);
	return function (id) {
		var fragment = fragments[id], object;
		if (fragment) return fragment;
		object = Type ? Type.getById(id) : db.objects.getById(id);
		fragment = fragments[id] = new Fragment();
		if (!object) return fragment;
		object.getAllEvents().forEach(function (event) {
			if (event.object._kind_ === 'sub-descriptor') return;
			if (filter && !filter(event)) return;
			fragment.update(event.object.__valueId__,
				{ value: serialize(event.value), stamp: event.stamp });
		});
		if (object.master === object) {
			object.on('update', function (event) {
				var id;
				if (event.object._kind_ === 'sub-descriptor') return;
				if (filter && !filter(event)) return;
				id = event.object.__valueId__;
				fragment.update(id, { value: serialize(event.value), stamp: event.stamp });
			});
		} else {
			object.master.on('update', function (event) {
				var id = event.object.__valueId__;
				if (!startsWith.call(id, object.__id__ + '/')) return;
				if (event.object._kind_ === 'sub-descriptor') return;
				if (filter && !filter(event)) return;
				fragment.update(id, { value: serialize(event.value), stamp: event.stamp });
			});
		}
		return fragment.flush();
	};
};
