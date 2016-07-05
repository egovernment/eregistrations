'use strict';

var db               = require('../db')
  , debug            = require('debug-ext')('pdf-generator')
  , ensureDbjsType   = require('dbjs/valid-dbjs-type')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , assign           = require('es5-ext/object/assign')
  , resolve          = require('path').resolve
  , root             = resolve(__dirname, '..')
  , templatePath     = resolve(root, 'apps-common/pdf-templates/costs-print.html')
  , htmlToPdf        = require('../server/html-to-pdf');

module.exports = function (BusinessProcess/*, options */) {
	var costsMap = ensureDbjsType(BusinessProcess).prototype.costs.map
	  , options  = normalizeOptions(arguments[1]);

	return {
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/pdf; charset=utf-8'
		},
		controller: function (data) {
			var inserts = {};

			debug('Generating costs print pdf');

			// Common inserts.
			inserts.locale       = db.locale;
			inserts.currentDate  = db.DateTime().toString();
			inserts.logo         = options.logo;
			inserts.businessName = data.businessName || '';
			inserts.total        = data.total || '0';

			delete data.businessName;
			delete data.total;

			// Additional inserts.
			if (options.customExtract) assign(inserts, options.customExtract(data));

			// Whats left are the costs.
			inserts.costs = Object.keys(data).map(function (costName) {
				var cost     = costsMap[costName]
				  , costMock = {}
				  , costLabel;

				// It can be one of additional inserts.
				if (!cost) return;

				costMock.value = data[costName] || 0;
				costLabel = cost.getDescriptor('label')._value_;

				if (typeof costLabel === 'function') {
					costMock.label = costLabel.apply({ master: inserts });
				} else {
					costMock.label = costLabel;
				}

				if (options.customCostExtract) {
					assign(costMock, options.customCostExtract(cost, data));
				}

				return costMock;
			}).filter(Boolean);

			return htmlToPdf(templatePath, '', {
				width: "210mm",
				height: "170mm",
				streamable: true,
				templateInserts: inserts
			});
		}
	};
};
