'use strict';

var from          = require('es5-ext/array/from')
  , getTable      = require('eregistrations/view/components/business-processes-table')
  , tableColumns  = require('eregistrations/view/components/business-process-table-columns')
  , statusMap     = require('../../apps/${ appName }/business-processes/map')
  , getOrderIndex = require('../../apps/${ appName }/business-processes/get-default-order-index')
  , env           = require('../../apps-common/client/env')

  , columns       = from(tableColumns.columns);

module.exports = exports = require('eregistrations/view/business-processes-table');

columns.push(tableColumns.archiverColumn);
columns.push(tableColumns.goToColumn);

exports._statusMap = function () {
	return statusMap;
};

exports._businessProcessTable = function () {
	return getBusinessProcessesTable({
		user: this.user,
		roleName: '${ appNameSuffix }',
		statusMap: statusMap,
		getOrderIndex: getOrderIndex,
		itemsPerPage: env.objectsListItemsPerPage,
		columns: columns,
		class: 'submitted-user-data-table'
	});
};
