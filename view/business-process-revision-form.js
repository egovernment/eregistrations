// Official form view

'use strict';

var revisionView = require('./business-process-revision');

exports._parent = revisionView;

exports['tab-business-process-processing'] = { class: { active: true } };
exports['tab-content'] = function () {
	section({ class: 'section-primary' }, exports._prepend.call(this),
		exports._officialForm.call(this));
};

exports._prepend = function () {
	var showApproveButton = and(
		eq(this.processingStep._revisionApprovalProgress, 1),
		revisionView._processingTabLabel.call(this),
		not(this.processingStep._revisionOfficialStatus)
	);

	return _if(showApproveButton, revisionView._approveButton.call(this));
};
exports._officialForm = Function.prototype;
