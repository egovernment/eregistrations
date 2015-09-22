'use strict';

module.exports = exports = require('../../view/user');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "My account"));
};

exports._servicesBoxList = function () {
	return [
		{ actionUrl: '/action-path-for-form/',
			buttonContent:  div({ class: 'service-button' },
				i({ class: 'fa fa-building' }), 'Register as individual trader'),
			content: span('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
				' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.'),
			condition: true },
		{ actionUrl: '/action-path-for-form/',
			buttonContent: div({ class: 'service-button' },
				i({ class: 'fa fa-building' }), 'Register as company trader'),
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
				' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.',
			condition: true },
		{ hrefUrl: '/action-path-for-form/',
			buttonContent: div({ class: 'service-button' },
				i({ class: 'fa fa-check-circle-o' }), 'Pay your anual solvency'),
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
				' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.',
			condition: true }
	];
};
