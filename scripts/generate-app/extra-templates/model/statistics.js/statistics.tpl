'use strict';

var forEach            = require('es5-ext/object/for-each')
  , uncapitalize       = require('es5-ext/string/#/uncapitalize')
  , db                 = require('../db')
  , processingStepsMap = require('../apps-common/processing-steps/meta');

var statistics = require('eregistrations/model/statistics')(db);

// TODO: Require all business processes model here, as e.g.:
// require('./business-process-coi');

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	var serviceName = uncapitalize.call(BusinessProcess.__id__.slice('BusinessProcess'.length));
	statistics.businessProcess.define(serviceName, { nested: true });
	BusinessProcess.prototype.certificates.map.forEach(function (cert, key) {
		statistics.businessProcess[serviceName].certificate.define(key, { nested: true });
	});
});

forEach(processingStepsMap, function (meta, stepName) {
	meta._services.forEach(function (serviceName) {
		var tokens = stepName.split('/'), current = statistics.businessProcess[serviceName].atPartB
		  , last = tokens.pop();
		if (tokens.length) {
			tokens.forEach(function (token) {
				if (!current[token]) current.define(token, { nested: true, type: db.Object });
				current = current[token];
			});
			current.define(last, { nested: true, type: db.StatisticsBusinessProcessProcessingStep });
		} else {
			current.define(last, { nested: true });
		}
	});
});

module.exports = statistics;
