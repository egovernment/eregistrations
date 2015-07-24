'use strict';

var assign  = require('es5-ext/object/assign')
  , copy    = require('es5-ext/object/copy')
  , forEach = require('es5-ext/object/for-each')
  , map     = require('es5-ext/object/map')
  , object  = require('es5-ext/object/valid-object')
  , nest    = require('mano/utils/nest-post-controllers')

  , keys = Object.keys;

module.exports = function (routes, data) {
	(object(routes) && object(data));

	data = map(data, copy);

	// Cleanup
	keys(routes).forEach(function (key) {
		forEach(data, function (officialRoutes) { delete officialRoutes[key]; });
	});

	// Assign
	forEach(data, function (officialRoutes, name) { assign(routes, nest(name, officialRoutes)); });
};
