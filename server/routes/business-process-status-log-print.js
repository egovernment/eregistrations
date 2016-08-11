// Server-only GET router

'use strict';

var driver                    = require('mano').dbDriver
  , statusLogPrintPdfRenderer = require('../pdf-renderers/business-process-status-log-print');

module.exports = {
	headers: {
		'Cache-Control': 'no-cache',
		'Content-Type': 'application/pdf; charset=utf-8'
	},
	controller: function (query) {
		var userId = this.req.$user;
		if (!userId || !query.id) return;
		return driver.getStorage('user').get(userId +
			'/initialBusinessProcesses*7' + query.id)(function (data) {
			if (!data || !data.value) return;
			return statusLogPrintPdfRenderer(query.id, { streamable: true });
		});
	}
};
