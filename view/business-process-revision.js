// Revision view for single business process

'use strict';

var _ = require('mano').i18n.bind('Official: Revision');

module.exports = exports = require('./business-process-official-preview');

exports._customPreviewInfo = function (context) {
	var businessProcess = context.businessProcess
	  , revisionStep    = context.processingStep;

	return insert(_if(revisionStep._isPending, section({ class: 'official-submission-toolbar' },
		// show buttons only if step is pending
		_if(eq(revisionStep._revisionProgress, 1),
			// show "approve" or "sent back" buttons only, when revision was finalized
			_if(eq(revisionStep._approvalProgress, 1),
				postButton({
					action: url('revision', businessProcess.__id__, 'approve'),
					buttonClass: 'button-main button-main-success',
					'data-hint': _("Enables the processing of the application."),
					class: 'hint-optional hint-optional-bottom',
					value: _("Validate revision")
				}),
				_if(eq(revisionStep._sendBackStatusesProgress, 1), postButton({
					action: url('revision', businessProcess.__id__, 'return'),
					buttonClass: 'button-main',
					class: 'hint-optional hint-optional-bottom',
					'data-hint': _("You can reject the registration when documents and/or " +
						"data that is sent can be determined as not real."),
					value: _("Return for corrections")
				})))),
				// show reject button at all times when revision is pending
		[dialog(
			{ id: 'reject-reason', class: 'dialog-reject dialog-modal' },
			header(
				label({ for: 'revision-reject-reason' }, h3(_("Reason for rejection of the file")))
			),
			section({ class: 'dialog-body' },
				form({ method: 'post', action: '/revision/' + businessProcess.__id__ + '/reject/' },
					p({ class: 'input' }, input({ id: 'revision-reject-reason',
							dbjs: revisionStep._rejectionReason })),
					p(input({ type: 'submit', value: _("Reject") })))),
			footer(p(a({ href: '' }, _("Cancel"))))
		), a({
			href: '#reject-reason',
			class: 'button-main button-main-error hint-optional' +
				' hint-optional-right hint-optional-multiline',
			'data-hint': _("When returning the application for corrections, the user will receive" +
				" a notification with information on the changes that must be done in his form or" +
				" in the documents that your request.")
		}, _("Reject application"))]
		)));
};
