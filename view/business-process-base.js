// Base view for user registration (Part A)

'use strict';

var _                = require('mano').i18n.bind('View: Business Process')
  , location         = require('mano/lib/client/location')
  , setProgressWidth = require('./utils/set-progress-width');

exports._parent = require('./user-base');

exports._match = 'businessProcess';

exports['sub-main'] = function () {
	exports._stepsMenuContainer.call(this);
	div({ class: 'content user-forms', id: 'step' });
};

exports._stepsMenu = function () {
	var ensureGuide = _if(eq(this.businessProcess._guideProgress, 1), 1, 0);
	return [
		li(
			{ class: 'user-steps-menu-start-step' },
			a({ href: '/', id: 'step-guide' },
				_("Guide")),
			div({ class: ['user-steps-menu-item-progress',
				_if(eq(this.businessProcess._guideProgress, 1),
					'user-steps-menu-step-completed')],
				style: mmap(this.businessProcess._guideProgress, setProgressWidth) })
		),
		li(
			a({ href: '/forms/', id: 'step-form' },
				_("Fill the form")
				),
			div({ class: ['user-steps-menu-item-progress',
				_if(eq(this.businessProcess.dataForms._progress, 1),
					'user-steps-menu-step-completed')],
				style: mmap(and(ensureGuide, this.businessProcess.dataForms._progress),
					setProgressWidth) })
		),
		li(
			a({ href: '/documents/', id: 'step-documents' },
				_("Upload docs")
				),
			div({ class: ['user-steps-menu-item-progress',
				_if(eq(this.businessProcess.requirementUploads._progress, 1),
					'user-steps-menu-step-completed')],
				style: mmap(and(ensureGuide, this.businessProcess.requirementUploads._progress),
					setProgressWidth) })
		),
		_if(this.businessProcess.costs._paymentWeight, li(
			a({ href: '/pay/', id: 'step-pay' },
				_("Pay")
				),
			div({ class: ['user-steps-menu-item-progress',
				_if(eq(this.businessProcess.costs._paymentProgress, 1),
					'user-steps-menu-step-completed')],
				style: mmap(and(ensureGuide, this.businessProcess.costs._paymentProgress),
					setProgressWidth) })
		)),
		li(
			a({ href: '/submission/', id: 'step-submission' },
				_("Send file")
				),
			div({ class: ['user-steps-menu-item-progress',
				_if(eq(this.businessProcess.submissionForms._progress, 1),
					'user-steps-menu-step-completed')],
				style: mmap(and(ensureGuide, this.businessProcess.submissionForms._progress),
					setProgressWidth) })
		)];
};

exports._stepsMenuContainer = function () {
	var mobileCheckbox;
	div({ class: 'user-steps-menu-fixed-top-placeholder' },
		nav({ id: 'user-steps-menu', class: 'user-steps-menu', fixed: true },
			div({ class: 'content user-steps-menu-wrapper' },
				label({ class: 'user-steps-menu-show', for: 'show-steps-control' }, "Steps"),
				mobileCheckbox = input({ id: 'show-steps-control', type: 'checkbox', role: 'button' }),
				ul({ class: 'user-steps-menu-list' }, exports._stepsMenu.call(this)))));

	location.on('change', function () {
		mobileCheckbox.checked = false;
	});
};
