'use strict';

var getBusinessProcessStorages = require('../utils/business-process-storages')
  , db                         = require('../../db')
  , deferred                   = require('deferred')
  , uncapitalize               = require('es5-ext/string/#/uncapitalize')
  , toDateInTz                 = require('../../utils/to-date-in-time-zone');

module.exports = function (query) {
	var result = { dateFrom: (query.dateFrom || new db.Date(2015, 0, 1)).toISOString().slice(0, 10),
		dateTo: (query.dateTo || new db.Date()).toISOString().slice(0, 10) };
	return getBusinessProcessStorages()(function (storages) {
		return deferred.map(storages, function (storage) {
			return storage.search({ keyPath: 'isApproved' }, function (id, data) {
				var dateStr, date, serviceName;
				if (data == null || data.value == null) return;
				date = toDateInTz(new Date(data.stamp / 1000), db.timeZone);
				if (query && date > query.dateTo) return;
				if (query && date < query.dateFrom) return;
				dateStr = date.toISOString().slice(0, 10);
				serviceName = storage.name.slice('businessProcess'.length);
				serviceName = uncapitalize.call(serviceName);
				if (!result[dateStr]) result[dateStr] = { serviceName: serviceName };
				if (!result[dateStr][serviceName]) result[dateStr][serviceName] = 0;

				result[dateStr][serviceName]++;
			});
		});
	})(result);
};
