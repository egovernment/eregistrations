'use strict';

var currentBusinessProcessMap = require('mano/lib/server/current-business-process-map')
  , customError               = require('es5-ext/error/custom')
  , statusLogPrintPdfRenderer = require('../pdf-renderers/business-process-status-log-print');

var assign = require('es5-ext/object/assign');

assign(exports, require('./authenticated')());

exports['business-process-status-log-print'] = {
	headers: {
		'Cache-Control': 'no-cache',
		'Content-Type': 'application/pdf; charset=utf-8'
	},
	controller: function (query) {
		var userId = this.req.$user, appName = this.req.$appName;
		if (!userId) return;
		return currentBusinessProcessMap(function (map) {
			var businessProcessId = map.get(userId);
			if (!businessProcessId) throw customError("Not Found", { statusCode: 404 });

			return statusLogPrintPdfRenderer(
				businessProcessId.slice(1),
				{ streamable: true, appName: appName }
			);
		});
	}
};
