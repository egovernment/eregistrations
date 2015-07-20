// Base view for user registration (Part A)

'use strict';

var location = require('mano/lib/client/location'),
_  = require('mano').i18n.bind('Registration'),
setProgressWidth = require('eregistrations/view/utils/set-progress-width');

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

exports._stepsMenu = function () {
	return [
		li(
			{ class: 'user-steps-menu-start-step' },
			a({ href: '/guide/', id: 'step-guide' },
				_("1. Guide")),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(this.businessProcess._guideProgress, setProgressWidth) })
		),
		li(
			a({ href: '/forms/', id: 'step-form' },
				_("2. Fill the form")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(this.businessProcess._dataForms.progress, setProgressWidth) })
		),
		li(
			a({ href: '/documents/', id: 'step-documents' },
				_("3. Upload docs")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(this.businessProcess._requirementUploads.progress, setProgressWidth) })
		),
		li(
			a(_("4. Pay")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(this.businessProcess._costs.onlinePaymentProgress, setProgressWidth) })
		),
		li(
			a({ href: '/submission/', id: 'step-submission' },
				_("5. Send file")
				),
			div({ class: 'user-steps-menu-item-progress',
				style: mmap(this.businessProcess._submissionForms.progress, setProgressWidth) })
		)];
};
