// Revision view for single business process

'use strict';

var _                = require('mano').i18n.bind('View: Official: Revision')
  , _d               = _
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ObservableValue  = require('observable-value')
  , renderMainInfo   = require('./components/business-process-main-info')
  , getUploads       = require('./utils/get-uploads-list');

exports._parent = require('./user-base');
exports._match = 'businessProcess';
exports._isPauseEnabled = false;

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var revisionStep      = this.processingStep
		  , isPauseEnabled    = exports._isPauseEnabled
		  , isRevisionPending = revisionStep._isRevisionPending
		  , isToolbarEnabled  = or(isRevisionPending, isPauseEnabled);

		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });

		insert(_if(isToolbarEnabled), [
			exports._customAlert.call(this),
			section(
				{ class: 'official-submission-toolbar' },
				// show buttons only if step is pending
				_if(isRevisionPending, div(
					{ class: 'official-submission-toolbar-wrapper' },
					_if(eq(revisionStep._revisionProgress, 1),
						// show "approve" or "sent back" buttons only, when revision was finalized
						_if(eq(revisionStep._revisionApprovalProgress, 1),
							_if(not(exports._processingTabLabel.call(this)),
								exports._approveButton.call(this)),
							_if(eq(revisionStep._sendBackStatusesProgress, 1),
								exports._returnButton.call(this)))),
					// show reject button at all times when revision is pending
					exports._rejectButton.call(this)
				)),
				_if(isPauseEnabled, exports._pauseButton.call(this))
			)
		]);

		insert(exports._revisionContainer.call(this));
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
	var options           = normalizeOptions(arguments[0])
	  , needsConfirmation = new ObservableValue(false);

	var toggleNeedsConfirmation = function () {
		needsConfirmation.value = !needsConfirmation.value;
	};

	return [dialog(
		{ id: 'reject-reason', class: 'dialog-reject dialog-modal' },
		header(_if(needsConfirmation,
			h3(_("Warning!")),
			label({ for: 'revision-reject-reason' }, h3(_("Reason for rejection of the file"))))),
		section(
			{ class: 'dialog-body' },
			form(
				{ id: 'reject-reason-form', method: 'post',
					action: '/revision/' + this.businessProcess.__id__ + '/reject/' },
				p({ class: 'input' }, input({ id: 'revision-reject-reason',
					dbjs: this.processingStep._rejectionReason }))
			),
			_if(needsConfirmation, p(_("You are about to reject the request, in doing so the user " +
				"will not be able to make corrections and send it again; if you want to ask for " +
				"corrections click 'cancel' and review the application until the " +
				"'Return to corrections' button is displayed. If you still want to reject the file click " +
				"'Confirm rejection'; this action is permanent and can not be undone.")))
		),
		footer(p(
			_if(needsConfirmation, input({ class: 'button-main-error', type: 'submit',
				form: 'reject-reason-form', value: _("Confirm rejection") })),
			a({ href: '', onclick: toggleNeedsConfirmation }, _("Cancel")),
			_if(not(needsConfirmation), a({ class: 'button-regular',
				href: '#reject-reason', onclick: toggleNeedsConfirmation },
				options.rejectLabel || _("Reject")))
		))
	), a({
		href: '#reject-reason',
		class: 'button-main button-main-error hint-optional' +
			' hint-optional-top hint-optional-multiline',
		'data-hint': _("You can reject the registration when documents and/or data that is " +
			"sent can be determined as not real.")
	}, _("Reject application"))];
};

exports._pauseButton = function (/*options*/) {
	var options = normalizeOptions(arguments[0]), isPaused = this.processingStep._isPaused, label;
	label = _if(isPaused, options.unpauseLabel || _("Unpause"), options.pauseLabel || _("Pause"));

	return postButton({
		action: url('revision', this.businessProcess.__id__, _if(isPaused, 'unpause', 'pause')),
		buttonClass: 'button-main',
		'data-hint': _("Pauses the processing of the application."),
		class: 'hint-optional hint-optional-bottom',
		value: label
	});
};

exports._revisionContainer = function () {
	var paymentUploads = getUploads(this.processingStep.paymentReceiptUploads, this.appName);
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
				}, _d(exports._processingTabLabel.call(this), {
					tabNumber: resolve(paymentUploads, '_length').map(function (length) {
						return length ? "4." : "3.";
					})
				}));
			}.bind(this)),

		div({ id: 'tab-content', class: 'business-process-revision' }));
};

exports._customAlert = Function.prototype;
