// Resolves events for specifiec key path on given object

'use strict';

var forEach     = require('es5-ext/object/for-each')
  , resolvePath = require('dbjs/_setup/utils/resolve-property-path')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , tokenize = resolvePath.tokenize, resolveObject = resolvePath.resolveObject;

module.exports = function (obj, path) {
	var names = tokenize(path), event
	  , propertyObj = resolveObject(obj, names)
	  , sKey = names[names.length - 1]
	  , desc = propertyObj._getDescriptor_(sKey)
	  , events = [];
	if (desc.master === obj.master) {
		event = desc._lastOwnEvent_;
		if (event) events.push(event);
	}
	if (!propertyObj.hasOwnProperty('__multiples__')) return events;
	if (!hasOwnProperty.call(propertyObj.__multiples__, sKey)) return events;
	forEach(propertyObj.__multiples__[sKey], function (item) {
		var event;
		if (!item.__id__) return;
		event = item._lastOwnEvent_;
		if (event) events.push(event);
	});
	return events;
};
