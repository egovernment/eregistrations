'use strict';

module.exports = exports = require('../../view/user');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "My account"));
};

exports._servicesBoxList = function () {
	return [
		{ button: postButton({ value: "Register as individual trader", buttonClass: 'button-main' }),
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
				' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.',
			condition: true },
		{ button: postButton({ value: "Register as company trader", buttonClass: 'button-main' }),
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
				' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.',
			condition: true },
		{ button: postButton({ value: "Pay basic tax", buttonClass: 'button-main' }),
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
				' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.',
			condition: true },
		{ button: postButton({ value: "Register ltd.", buttonClass: 'button-main' }),
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
				' Maecenas mollis ac nisl at ultricies. Praesent porta pretium nisl at consequat.',
			condition: false }
	];
};
