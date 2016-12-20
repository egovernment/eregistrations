// Server-only GET router

'use strict';

/* Example configuration below

var url = require('url')
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel');

module.exports = require('eregistrations/server/routes/official')([{
	roleName: 'officer',
	statusMap: require('../../official-validation/business-processes/officer/map'),
	listProperties: require('../../../apps-common/business-process-list-properties'),
	listComputedProperties: require('../../../apps-common/business-process-list-computed-properties'),
	itemsPerPage: require('../../../server/env').objectsListItemsPerPage,
	statusIndexName: 'processingSteps/map/officer/status'
}, {
	roleName: 'revision',
	statusMap: require('../../official-revision/business-processes/map'),
	listProperties: require('../../../apps-common/business-process-list-properties'),
	listComputedProperties: require('../../../apps-common/business-process-list-computed-properties'),
	itemsPerPage: require('../../../server/env').objectsListItemsPerPage,
	statusIndexName: 'processingSteps/map/revision/status'
}], {
	resolveConf: function (req) {
		var pathname = url.parse(req.headers.referer).pathname;
		if (pathname === '/') return 'revision';
		return hyphenToCamel.call(pathname.slice(1, -1));
	}
});
*/
