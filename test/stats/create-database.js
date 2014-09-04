'use strict';

var sourceDb = require('../__playground/stats/example-model')
  , isFunction = require('es5-ext/function/is-function');

module.exports = function (t, a) {
	var res = t(sourceDb);

	a(res.User.minDirectors, sourceDb.User.minDirectors, "Constructor property");
	a.deep(res.User.prototype.submissions, sourceDb.User.prototype.submissions, "Nested");
	a(res.User.prototype.getDescriptor('inventory').label,
		sourceDb.User.prototype.getDescriptor('inventory').label,
		"Property with marked statsBase");
	a(isFunction(res.Currency.getDescriptor('format').type), true,
		"Method of parent of property with marked statsBase");
	a(res.User.prototype.isShoppingGallery, false,
		"Property with marked not null statsBase, with computed value of primitive type" +
			" - we take value");
	a(res.User.prototype.favouritePartner, undefined,
			"Property with marked null statsBase, with computed value of Object type" +
			" - we ignore property");
	a(res.User.prototype.isManager, true,
		"Property with marked null statsBase with default non computed value" +
			" - we ignore default value and statsBase");
	a(res.User.prototype.inventory, 5,
			"Property with marked null statsBase with default non computed value" +
			" - we ignore statsBase");
	a(res.User.prototype.members, undefined,
			"Property with marked null statsBase without default value");
	sourceDb.User.prototype._forEachOwnDescriptor_(function (descProp) {
		if (!descProp.hasOwnProperty('statsBase') && !descProp.nested) {
			a(res.Partner.prototype[descProp.key], undefined,
				"Unwanted property: " + descProp.key);
		}
	});
};
