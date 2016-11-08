'use strict';

var statusMap = require('../../apps/${ appName }/business-processes/map')
  , columns   = require('../components/business-process-table-columns');

var getOrderIndex =
	require('../../apps/${ appName }/business-processes/get-default-order-index');

module.exports = exports = require('eregistrations/view/print-business-processes-table');

exports._statusMap = function () { return statusMap; };
exports._getOrderIndex = function () { return getOrderIndex; };
exports._columns = function () { return columns; };
