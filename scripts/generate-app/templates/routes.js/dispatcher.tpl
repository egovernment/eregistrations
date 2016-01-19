// Routes for the views.

'use strict';

var assign = require('es5-ext/object/assign');

module.exports = exports = assign(exports, require('eregistrations/routes/official')(function () {
//CHANGEME - this function should return step
}));

require('../../view/print-base');
require('../../view/user-base');
require('../../view/dispatcher/dispatcher-base');

exports['[0-9][a-z0-9]*'].view = require('eregistrations/view/business-process-official-preview');

exports['/'] = {
	decorateContext: function () {
	/* Example setup
		this.processingStep = db.BusinessProcessCoi.prototype.processingSteps.map.revision;
		this.statusMap = revisionStatusMap;
		this.roleName = 'officialRevision';
		this.shortRoleName = 'revision';
		this.getOrderIndex = revisionGetOrderIndex;
		*/
	},
	view: require('eregistrations/view/dispatcher-assignments-panel')
};
