// Revision view for single business process

'use strict';

var renderDocumentsAndData = require('./_business-process-documents-and-data')
, renderMainInfo = require('./_business-process-main-info')
, _       = require('mano').i18n.bind('Official: Revision');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var revisionStep = this.businessProcess.processingSteps.map.revision;

		renderMainInfo(this.businessProcess);

		insert(_if(revisionStep._isPending, [
			// show buttons only if step is pending

			_if(eq(revisionStep._revisionProgress, 1),
				// show "approve" or "sent back" buttons only, when revision was finalized
				_if(eq(revisionStep._approvalProgress, 1),
					postButton(
						{ action: url('revision', this.businessProcess.__id__, 'approve'),
							buttonClass: 'button-main button-main-success',
							'data-hint': _("Enables the processing of the application."),
							class: 'hint-optional hint-optional-bottom',
							value: _("Validate revision") }
					),
					postButton(
						{ action: url('revision', this.businessProcess.__id__, 'return'),
							buttonClass: 'button-main',
							class: 'hint-optional hint-optional-bottom',
							'data-hint': _("You can reject the registration when documents and/or data that is" +
								" sent can be determined as not real."),
							value: _("Return for corrections") }
					))),
					// show reject button at all times when revision is pending
			a({ href: '#rechazar-expediente',
				class: 'button-main button-main-error hint-optional' +
				' hint-optional-right hint-optional-multiline',
				'data-hint': _("When returning the application for corrections, the user will receive" +
					" a notification with information on the changes that must be done in his form or" +
					" in the documents that your request.") },
				_("Reject application"))
		]));

		renderDocumentsAndData(this.businessProcess,
			{ urlPrefix: '/' + this.businessProcess.__id__ + '/' });
	}
};
