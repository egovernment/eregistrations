// Business process dedicated search query handler
// (used to handle business processes table in official roles)

'use strict';

var appLocation       = require('mano/lib/client/location')
  , setupQueryHandler = require('../../../utils/setup-client-query-handler')
  , queryConf         = require('../../../apps/inspector/query-conf');

module.exports = exports = function (listManager/*, pathname*/) {
	var queryHandler = setupQueryHandler(queryConf, appLocation, arguments[1] || '/');

	queryHandler._itemsPerPage = listManager.itemsPerPage;
	queryHandler._listManager = listManager;
	queryHandler.on('query', function (query) { listManager.update(query); });

	return queryHandler;
};
