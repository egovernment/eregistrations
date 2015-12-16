// Revision view for single business process

'use strict';

var renderMainInfo = require('./_business-process-main-info')
, _       = require('mano').i18n.bind('Official: Revision');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var revisionStep = this.processingStep;

		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });

		insert(_if(revisionStep._isPending, section({ class: 'official-submission-toolbar' },
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
					_if(eq(revisionStep._sendBackStatusesProgress, 1), postButton(
						{ action: url('revision', this.businessProcess.__id__, 'return'),
							buttonClass: 'button-main',
							class: 'hint-optional hint-optional-bottom',
							'data-hint': _("You can reject the registration when documents and/or " +
								"data that is sent can be determined as not real."),
							value: _("Return for corrections") }
					)))),
					// show reject button at all times when revision is pending
			[dialog({ id: 'reject-reason', class: 'dialog-reject dialog-modal' },
				header(
					label({ for: 'revision-reject-reason' }, h3(_("Reason for rejection of the file")))
				),
				section({ class: 'dialog-body' },
					form({ method: 'post', action: '/revision/' + this.businessProcess.__id__ + '/reject/' },
						p({ class: 'input' }, input({ id: 'revision-reject-reason',
								dbjs: this.processingStep._rejectionReason })),
						p(input({ type: 'submit', value: _("Reject") })))),
				footer(p(a({ href: '' }, _("Cancel"))))),
				a({ href: '#reject-reason',
					class: 'button-main button-main-error hint-optional' +
					' hint-optional-right hint-optional-multiline',
					'data-hint': _("When returning the application for corrections, the user will receive" +
						" a notification with information on the changes that must be done in his form or" +
						" in the documents that your request.") },
					_("Reject application"))]
			)));

		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-documents',
					href: '/revision/user-id/documents/' },
				_("Revision of the documents")),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-payments',
					href: '/revision/user-id/payments/' },
				_("Revision of payments")),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-datas',
					href: '/revision/user-id/datas/' },
				_("Revision of data")),
			div({ id: 'official-revision-content', class: 'business-process-revision' }));
	}
};
