// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/users-admin')({
	listProperties: require('../../../apps-common/user-list-properties'),
	itemsPerPage: require('../../../env').objectsListItemsPerPage
});
