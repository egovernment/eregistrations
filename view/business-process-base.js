// Base view for user registration (Part A)

'use strict';

var location = require('mano/lib/client/location'),
_  = require('mano').i18n.bind('Registration'),
setProgressWidth = require('./utils/set-progress-width');

exports._parent = require('./user-base');

exports._match = 'businessProcess';

exports['sub-main'] = function () {

	var mobileCheckbox;

	div({ class: 'user-steps-menu-fixed-top-placeholder' },
		nav({ id: 'user-steps-menu', class: 'user-steps-menu', fixed: true },
			div({ class: 'content user-steps-menu-wrapper' },
				label({ class: 'user-steps-menu-show', for: 'show-steps-control' }, "Steps"),
				mobileCheckbox = input({ id: 'show-steps-control', type: 'checkbox', role: 'button' }
					), ul({ class: 'user-steps-menu-list' }, exports._stepsMenu(this)))));
	div({ class: 'content user-forms', id: 'step' });

	location.on('change', function () {
		mobileCheckbox.checked = false;
	});

};

exports._stepsMenu = function (context) {
	return [
		li(
			{ class: 'user-steps-menu-start-step' },
			a({ href: '/', id: 'step-guide' },
				_("Guide")),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(context.businessProcess._guideProgress, setProgressWidth) })
		),
		li(
			a({ href: '/forms/', id: 'step-form' },
				_("Fill the form")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(context.businessProcess.dataForms._progress, setProgressWidth) })
		),
		li(
			a({ href: '/documents/', id: 'step-documents' },
				_("Upload docs")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(context.businessProcess.requirementUploads._progress, setProgressWidth) })
		),
		_if(not(eq(context.businessProcess.costs._paymentWeight, 0)), li(
			a({ href: '/pay/', id: 'step-pay' },
				_("Pay")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(context.businessProcess.costs._paymentProgress, setProgressWidth) })
		)),
		li(
			a({ href: '/submission/', id: 'step-submission' },
				_("Send file")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(context.businessProcess.submissionForms._progress, setProgressWidth) })
		)];
};
