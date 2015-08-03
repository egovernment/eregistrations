'use strict';

var documentsAndData = require('./_business-process-documents-and-data')
, userData = require('./_business-process-main-info');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var revisionStep = this.businessProcess.processingSteps.map.revision;

		userData(this.businessProcess);

		_if(revisionStep._isPending, [
			// show buttons only if step is pending

			_if(eq(revisionStep._revisionProgress, 1),
				// show "approve" or "sent back" buttons only, when revision was finalized
				_if(eq(revisionStep._approvalProgress, 1),
					button("Approve"),
					button("Return for corrections"))),
					// show reject button at all times when revision is pending
			button("Reject")
		]);

		documentsAndData(this.businessProcess);
	}
};
