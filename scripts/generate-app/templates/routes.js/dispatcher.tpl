// Routes for the views.

'use strict';

var assign = require('es5-ext/object/assign');

assign(exports, require('eregistrations/routes/official')(function () {
/* Example setup
var stepsMap = this.businessProcess.processingSteps.map;
if (stepsMap.officer.isPending) return stepsMap.officer;
if (stepsMap.revision.isPending) return stepsMap.revision;
*/
}));

require('../../view/print-base');
require('../../view/user-base');
require('../../view/dispatcher/dispatcher-base');

exports['[0-9][a-z0-9]*'] = exports['[0-9][a-z0-9]*/documents'];

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
