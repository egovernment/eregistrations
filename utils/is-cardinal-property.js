'use strict';

var db                  = require('mano').db
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value');

module.exports = function (object, property) {
	var isCardinal = false, keyPath = [property];
	ensureStringifiable(property);

	while (object) {
		if (object.owner && object.owner.owner && object.owner.owner instanceof db.NestedMap) {
			isCardinal = (object.owner.owner.cardinalPropertyKey === keyPath.join('/'));
			break;
		}
		keyPath.unshift(object.key);
		object = object.owner;
	}

	return isCardinal;
};
