'use strict';

var sourceDb = require('./__playground/example-model')
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
	a(res.Partner.prototype.fee, 0,
		"Property with marked statsBase with default value overwritten by statsBase");
	a(res.Partner.prototype.isShoppingGallery, undefined,
		"Unwanted property is not present");
};
