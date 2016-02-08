// Util for getting property label, be it static on descriptor or set up as dynamic getter.

'use strict';

module.exports = function (resolvedProperty) {
	var descriptor      = resolvedProperty.descriptor
	  , dynamicLabelKey = descriptor.dynamicLabelKey;

	return dynamicLabelKey ? descriptor.object.getObservable(dynamicLabelKey) : descriptor.label;
};
