'use strict';

var getData    = require('../business-process-query/get-data')
  , getDateMap = require('../business-process-query/get-status-history-date-map');

module.exports = function () {
	var driver = require('mano').dbDriver;

	return getData(driver)(getDateMap).done();
};
