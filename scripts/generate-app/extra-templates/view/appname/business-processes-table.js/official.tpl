'use strict';

var from        = require('es5-ext/array/from')
  , getTable    = require('eregistrations/view/components/business-processes-table')
  , tableCols   = require('../components/business-process-table-columns')
  , statusMap   = require('../../apps/${ appName }/business-processes/map')
  , getOrderIdx = require('../../apps/${ appName }/business-processes/get-default-order-index')
  , env         = require('../../apps-common/client/env')

  , columns       = from(tableCols.columns);

module.exports = exports = require('eregistrations/view/business-processes-table');

columns.push(tableCols.archiverColumn);

exports._statusMap = function () {
	return statusMap;
};

exports._businessProcessTable = function () {
	return getTable({
		user: this.user,
		roleName: '${ appNameSuffix }',
		statusMap: statusMap,
		getOrderIndex: getOrderIdx,
		itemsPerPage: env.objectsListItemsPerPage,
		columns: columns,
		class: 'submitted-user-data-table'
	});
};
