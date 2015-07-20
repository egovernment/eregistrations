// Base view for user registration (Part A)

'use strict';

var location = require('mano/lib/client/location');

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

exports._stepsMenu = Function.prototype;
