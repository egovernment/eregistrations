// Revision view for single business process

'use strict';

var _                = require('mano').i18n.bind('Official: Revision')
  , normalizeOptions = require('es5-ext/object/normalize-options');

module.exports = exports = require('./business-process-official-preview');

exports._customPreviewInfo = function (context/*, options*/) {
	var options      = arguments[1]
	  , revisionStep = context.processingStep;

	return insert(_if(revisionStep._isRevisionPending, section({ class: 'official-submission-toolbar' },
		// show buttons only if step is pending
		_if(eq(revisionStep._revisionProgress, 1),
			// show "approve" or "sent back" buttons only, when revision was finalized
			_if(eq(revisionStep._revisionApprovalProgress, 1),
				exports._approveButton.call(context, options),
				_if(eq(revisionStep._sendBackStatusesProgress, 1),
					exports._returnButton.call(context, options)))),
				// show reject button at all times when revision is pending
		exports._rejectButton.call(context, options))));
};

exports._approveButton = function (/*options*/) {
	var options = normalizeOptions(arguments[1]);

	return postButton({
		action: url('revision', this.businessProcess.__id__, 'approve'),
		buttonClass: 'button-main button-main-success',
		'data-hint': _("Enables the processing of the application."),
		class: 'hint-optional hint-optional-bottom',
		value: options.acceptLabel || _("Validate revision")
	});
};

exports._returnButton = function (/*options*/) {
	var options = normalizeOptions(arguments[1]);

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
	var options = normalizeOptions(arguments[1]);

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
