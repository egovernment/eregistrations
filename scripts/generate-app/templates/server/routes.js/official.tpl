// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/official')({
	roleName: '${ appNameSuffix }',
	statusMap: require('../business-processes/map'),
	listProperties: require('../../../apps-common/business-process-list-properties'),
	listComputedProperties: require('../../../apps-common/business-process-list-computed-properties'),
	dbDriver: require('../../../server/db/persistent'),
	searchablePropertyNames:
		require('../../../apps-common/searchable-business-process-property-names'),
	getOrderIndex: require('../business-processes/get-default-order-index'),
	itemsPerPage: require('../../../env').objectsListItemsPerPage
});
