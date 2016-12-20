'use strict';

var ensureBusinessProcessType = require('../../utils/ensure-business-process-type')
  , getCostsPrintController   = require('./controllers/business-process-costs-print')
  , getAuthenticatedRoutes    = require('./authenticated');

module.exports = function (type/*, options*/) {
	ensureBusinessProcessType(type);

	var options = Object(arguments[1]), routes = getAuthenticatedRoutes(options);
	routes['costs-print'] = getCostsPrintController(type, options.costsPrintOptions);
	return routes;
};
