// Revision view for single business process

'use strict';

var _                = require('mano').i18n.bind('Official: Revision')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , renderMainInfo   = require('./components/business-process-main-info');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var revisionStep = this.processingStep;

		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });

		insert(_if(revisionStep._isRevisionPending, [exports._customAlert(this), section(
			{ class: 'official-submission-toolbar' },
			// show buttons only if step is pending
			_if(eq(revisionStep._revisionProgress, 1),
				// show "approve" or "sent back" buttons only, when revision was finalized
				_if(eq(revisionStep._revisionApprovalProgress, 1),
					exports._approveButton.call(this),
					_if(eq(revisionStep._sendBackStatusesProgress, 1),
						exports._returnButton.call(this)))),
					// show reject button at all times when revision is pending
			exports._rejectButton.call(this)
		)]));

		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-documents',
					href: '/' + this.businessProcess.__id__ + '/' },
				_("Revision of the documents")),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-payments',
					href: '/' + this.businessProcess.__id__ + '/payment-receipts/' },
				_("Revision of payments")),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-datas',
					href: '/' + this.businessProcess.__id__ + '/data/' },
				_("Revision of data")),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-processing',
					href: '/' + this.businessProcess.__id__ + '/processing/' },
				_("Processing")),
			div({ id: 'official-revision-content', class: 'business-process-revision' }));
	}
};

exports._approveButton = function (/*options*/) {
	var options = normalizeOptions(arguments[0]);

	return postButton({
		action: url('revision', this.businessProcess.__id__, 'approve'),
		buttonClass: 'button-main button-main-success',
		'data-hint': _("Enables the processing of the application."),
		class: 'hint-optional hint-optional-bottom',
		value: options.acceptLabel || _("Validate revision")
	});
};

exports._returnButton = function (/*options*/) {
	var options = normalizeOptions(arguments[0]);

	return postButton({
		action: url('revision', this.businessProcess.__id__, 'return'),
		buttonClass: 'button-main',
		class: 'hint-optional hint-optional-bottom',
		'data-hint': _("When returning the application for corrections, the user will " +
			"receive a notification with information on the changes that must be done " +
			"in his form or in the documents that your request."),
		value: options.sendBackLabel || _("Return for corrections")
	});
};

// Technically, it's not 'just' a button that gets returned from here, but in this case it makes
// no sense to return just the 'a' element.
exports._rejectButton = function (/*options*/) {
	var options = normalizeOptions(arguments[0]);

	return [dialog(
		{ id: 'reject-reason', class: 'dialog-reject dialog-modal' },
		header(
			label({ for: 'revision-reject-reason' }, h3(_("Reason for rejection of the file")))
		),
		section({ class: 'dialog-body' },
			form({ method: 'post', action: '/revision/' + this.businessProcess.__id__ + '/reject/' },
				p({ class: 'input' }, input({ id: 'revision-reject-reason',
						dbjs: this.processingStep._rejectionReason })),
				p(input({ type: 'submit', value: options.rejectLabel || _("Reject") })))),
		footer(p(a({ href: '' }, _("Cancel"))))
	), a({
		href: '#reject-reason',
		class: 'button-main button-main-error hint-optional' +
			' hint-optional-right hint-optional-multiline',
		'data-hint': _("You can reject the registration when documents and/or data that is " +
			"sent can be determined as not real.")
	}, _("Reject application"))];
};

exports._customAlert = Function.prototype;
