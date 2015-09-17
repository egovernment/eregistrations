// Resolves key path for given object into an event and adds it to provided fragment

'use strict';

var forEach     = require('es5-ext/object/for-each')
  , resolvePath = require('dbjs/_setup/utils/resolve-property-path')
  , serialize   = require('dbjs/_setup/serialize/value')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , tokenize = resolvePath.tokenize, resolveObject = resolvePath.resolveObject;

module.exports = function (fragment, obj, path) {
	var names = tokenize(path), event
	  , propertyObj = resolveObject(obj, names)
	  , sKey = names[names.length - 1]
	  , desc = propertyObj._getDescriptor_(sKey);
	if (desc.master === obj.master) {
		event = desc._lastOwnEvent_;
		if (event) {
			fragment.update(desc.__valueId__, { value: serialize(event.value), stamp: event.stamp });
		}
	}
	if (!propertyObj.hasOwnProperty('__multiples__')) return;
	if (!hasOwnProperty.call(propertyObj.__multiples__, sKey)) return;
	forEach(propertyObj.__multiples__[sKey], function (item) {
		var event;
		if (!item.__id__) return;
		event = item._lastOwnEvent_;
		if (!event) return;
		fragment.update(item.__valueId__, { value: serialize(event.value), stamp: event.stamp });
	});
};
