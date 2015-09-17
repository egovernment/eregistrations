// Resolves key path for given object into an event and adds it to provided fragment

'use strict';

var resolvePath = require('dbjs/_setup/resolve-property-path')
  , serialize   = require('dbjs/_setup/serialize/value')

  , tokenize = resolvePath.tokenize, resolveObject = resolvePath.resolveObject;

module.exports = function (fragment, obj, path) {
	var names = tokenize(path), desc, propertyObj, event;
	propertyObj = resolveObject(obj, names);
	desc = propertyObj._getDescriptor_(names[names.length - 1]);
	if (desc.master !== obj.master) return;
	event = desc._lastOwnEvent_;
	if (!event) return;
	fragment.update(obj.__id__ + '/' + path, { value: serialize(event.value), stamp: event.stamp });
};
