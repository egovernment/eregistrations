// User: Account documents and data view

'use strict';

var _ = require('mano').i18n.bind('User'),
loc     = require('mano/lib/client/location');

exports._parent = require('./user');

exports['user-account-data'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessSelect;
	section({ class: "section-primary user-doc-data" },
		businessSelect = select({ id: 'business-process-select' },
			option({ value: '/', selected: eq(loc._pathname, '/') },
				_("Select an entity to display its documents and data")),
			list(this.user.initialBusinessProcesses, function (process) {
				option({
					value: '/business-process/' + process.__id__ + '/',
					selected: eq(loc._pathname, '/business-process/' + process.__id__ + '/')
				},
					process._businessName);
			})),
		div({ id: 'preview' }));
	businessSelect.setAttribute('onchange', 'location.href = this.value + ' +
		'\'#business-process-summary\'');
	businessSelect.onchange = function (ev) {
		loc.goto(ev.target.value);
	};
};
