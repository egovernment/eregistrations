// Prototype base view for user registration (Part A)

'use strict';

module.exports = exports = require('../../view/business-process-base');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a({ href: '/guide/' }, "Process"));
};

exports._stepsMenu = function () {
	return [
		li(
			{ class: 'user-steps-menu-start-step' },
			a({ href: '/guide/', id: 'step-guide' },
				"1. Guide"),
			div({ class: 'user-steps-menu-item-progress', style: 'width: 100%' })
		),
		li(
			a({ href: '/forms/', id: 'step-form' },
				"2. Fill the form"
				),
			div({ class: 'user-steps-menu-item-progress', style: 'width: 95%' })
		),
		li(
			a({ href: '/documents/', id: 'step-documents' },
				"3. Upload docs"
				),
			div({ class: 'user-steps-menu-item-progress', style: 'width: 50%' })
		),
		li(
			a({ href: '/pay/', id: 'step-pay' },
				"4. Pay"
				),
			div({ class: 'user-steps-menu-item-progress' })
		),
		li(
			a({ href: '/submission/', id: 'step-submission' },
				"5. Send file"
				),
			div({ class: 'user-steps-menu-item-progress' })
		)];
};
