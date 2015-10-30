'use strict';

module.exports = exports = require('../../view/user');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a("My account"));
};

exports._servicesBoxList = function () {
	return [{
		actionUrl: '/action-path-for-form/',
		buttonContent:  div({ class: 'user-account-service-button' },
			i({ class: 'fa fa-user' }), 'Register as individual trader'),
		content: span('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
			' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.')
	}, {
		actionUrl: '/action-path-for-form/',
		buttonContent: div({ class: 'user-account-service-button' },
			i({ class: 'fa fa-building' }), 'Register as company trader'),
		content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
			' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.'
	}, {
		hrefUrl: '/action-path-for-form/',
		buttonContent: div({ class: 'user-account-service-button' },
			i({ class: 'fa fa-check-circle-o' }), 'Pay your anual solvency'),
		content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
			' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.',
		disabledCondition: true
	}];
};
