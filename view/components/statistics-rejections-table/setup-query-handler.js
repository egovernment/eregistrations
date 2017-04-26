// Statistics rejections dedicated search query handler

'use strict';

var appLocation       = require('mano/lib/client/location')
  , setupQueryHandler = require('../../../utils/setup-client-query-handler')
  , queryConf         = require('../../../apps/statistics/rejections-query-conf');

module.exports = exports = function (listManager/*, pathname*/) {
	var queryHandler = setupQueryHandler(queryConf, appLocation, arguments[1] || '/');

	queryHandler._itemsPerPage = listManager.itemsPerPage;
	queryHandler._listManager = listManager;
	queryHandler.on('query', function (query) {
		if (query.dateFrom) {
			query.dateFrom = query.dateFrom.toJSON();
		}
		if (query.dateTo) {
			query.dateTo = query.dateTo.toJSON();
		}

		listManager.update(query);
	});

	return queryHandler;
};