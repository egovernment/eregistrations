// Revision view for single business process

'use strict';

var _                = require('mano').i18n.bind('View: Official: Revision')
  , _d               = _
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , renderMainInfo   = require('./components/business-process-main-info')
  , getUploads       = require('./utils/get-uploads-list');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var revisionStep = this.processingStep,
			paymentUploads = getUploads(this.processingStep.paymentReceiptUploads, this.appName);

		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });

		insert(_if(revisionStep._isRevisionPending, [exports._customAlert.call(this), section(
			{ class: 'official-submission-toolbar' },
			// show buttons only if step is pending
			_if(eq(revisionStep._revisionProgress, 1),
				// show "approve" or "sent back" buttons only, when revision was finalized
				_if(eq(revisionStep._revisionApprovalProgress, 1),
					_if(not(exports._processingTabLabel.call(this)),
						exports._approveButton.call(this)),
					_if(eq(revisionStep._sendBackStatusesProgress, 1),
						exports._returnButton.call(this)))),
					// show reject button at all times when revision is pending
			exports._rejectButton.call(this)
		)]));

		section({ class: 'section-tab-nav' },
			a({
				class: 'section-tab-nav-tab',
				id: 'tab-business-process-documents',
				href: '/' + this.businessProcess.__id__ + '/'
			}, _if(gt(this.processingStep.requirementUploads.processable._size, 0), [
				_("${ tabNumber } Revision of the documents", { tabNumber: "1." }),
				_if(eq(this.processingStep.requirementUploads._approvalProgress, 1),
					span({ class: 'fa fa-check' })),
				_if(gt(this.processingStep.requirementUploads.rejected._size, 0),
					span({ class: 'fa fa-exclamation' }))
			], _("${ tabNumber } Documents", { tabNumber: "1." }))),

			_if(resolve(paymentUploads, '_length'),
				a({
					class: 'section-tab-nav-tab',
					id: 'tab-business-process-payments',
					href: '/' + this.businessProcess.__id__ + '/payment-receipts/'
				}, _if(gt(this.processingStep.paymentReceiptUploads.processable._size, 0), [
					_("${ tabNumber } Revision of payments", { tabNumber: "2." }),
					_if(eq(this.processingStep.paymentReceiptUploads._approvalProgress, 1),
						span({ class: 'fa fa-check' })),
					_if(gt(this.processingStep.paymentReceiptUploads.rejected._size, 0),
						span({ class: 'fa fa-exclamation' }))
				], _("${ tabNumber } Payment receipts", { tabNumber: "2." })))),

			a({
				class: 'section-tab-nav-tab',
				id: 'tab-business-process-data',
				href: '/' + this.businessProcess.__id__ + '/data/'
			}, _if(this.processingStep.dataFormsRevision._isProcessable, [
				_("${ tabNumber } Revision of data",
					{ tabNumber: _if(resolve(paymentUploads, '_length'), "3.", "2.") }),
				_if(and(this.processingStep.dataFormsRevision._isProcessable,
					eq(this.processingStep.dataFormsRevision._approvalProgress, 1)),
						span({ class: 'fa fa-check' })),
				_if(and(this.processingStep.dataFormsRevision._isProcessable,
					gt(this.processingStep.dataFormsRevision._sentBackProgress, 0)),
					span({ class: 'fa fa-exclamation' }))
			], _("${ tabNumber } Data", {
				tabNumber: _if(resolve(paymentUploads, '_length'), "3.", "2.")
			}))),

			_if(exports._processingTabLabel.call(this),
				function () {
					return a({
						class: 'section-tab-nav-tab',
						id: 'tab-business-process-processing',
						href: '/' + this.businessProcess.__id__ + '/processing/'
					}, _d(exports._processingTabLabel.call(this),
						{ tabNumber: resolve(paymentUploads, '_length').map(function (length) {
							return length ? "4." : "3.";
						}) }));
				}.bind(this)),

			div({ id: 'tab-content', class: 'business-process-revision' }));
	}
};

exports._processingTabLabel = Function.prototype;

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
			' hint-optional-top hint-optional-multiline',
		'data-hint': _("You can reject the registration when documents and/or data that is " +
			"sent can be determined as not real.")
	}, _("Reject application"))];
};

exports._customAlert = Function.prototype;
