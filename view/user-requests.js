// User: Chosen business process main display

'use strict';

var _ = require('mano').i18n.bind('View: Business process summary'),
	loc = require('mano/lib/client/location');

exports._parent = require('./user');
exports._match = 'businessProcess';

exports['user-account-data'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessSelect;
	section({ class: "section-primary user-account-doc-data" },
		_if(gt(this.user.initialBusinessProcesses._size, 1),
			[div({ class: "section-primary-sub" },
				p(label({ for: 'business-process-select' },
					_("Please select an entity in the selector below to display it documents and data"))),
					p({ class: 'user-account-selector' },
					businessSelect = select({ id: 'business-process-select' },
						option({ value: '/', selected: eq(loc._pathname, '/') },
							_("Select an entity to display its documents and data")),
						list(this.user.initialBusinessProcesses, function (process) {
							option({
								value: '/requests/' + process.__id__ + '/',
								selected: eq(loc._pathname, '/requests/' + process.__id__ + '/')
							},
								process._businessName);
						})))
				),
				div({ id: 'user-requests-preview' })],
			_if(eq(this.user.initialBusinessProcesses._size, 1),
				insert(require('./_business-process-documents-and-data-brief.js')(
					this.user.initialBusinessProcesses.first
				)),
					p(_('No requests started'))
				)));

	businessSelect.setAttribute('onchange', 'location.href = this.value + ' +
		'\'#business-process-summary\'');
	businessSelect.onchange = function (ev) {
		loc.goto(ev.target.value);
	};
};
