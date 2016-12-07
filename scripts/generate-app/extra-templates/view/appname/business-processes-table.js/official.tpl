'use strict';

var from        = require('es5-ext/array/from')
  , getTable    = require('eregistrations/view/components/business-processes-table')
  , tableCols   = require('eregistrations/view/components/table-columns')
  , statusMap   = require('../../apps/${ appName }/business-processes/map')
  , getOrderIdx = require('../../apps/${ appName }/business-processes/get-default-order-index')
  , env         = require('../../apps-common/client/env')

  , columns     = from(require('../components/business-processes-table-columns'));

module.exports = exports = require('eregistrations/view/business-processes-table');

columns.push(tableCols.businessProcessArchiverColumn);

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
