'use strict';

var assign  = require('es5-ext/object/assign')
  , forEach = require('es5-ext/object/for-each')
  , object  = require('es5-ext/object/valid-object')
  , nest    = require('mano/utils/nest-post-controllers')

  , keys = Object.keys;

module.exports = function (routes, data) {
	(object(routes) && object(data));

	// Cleanup
	keys(routes).forEach(function (key) {
		forEach(data, function (officialRoutes) { delete officialRoutes[key]; });
	});

	// Assign
	forEach(data, function (officialRoutes, name) { assign(routes, nest(name, officialRoutes)); });
};
