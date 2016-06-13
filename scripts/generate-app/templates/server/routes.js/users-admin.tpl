// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/users-admin')({
	listProperties: require('eregistrations/apps/users-admin/user-list-properties'),
	itemsPerPage: require('../../../env').objectsListItemsPerPage
});
