// User: Chosen business process main display

'use strict';

var _ = require('mano').i18n.bind('View: Business process summary'),
	loc = require('mano/lib/client/location'),
	documentsAndDataBrief = require('./_business-process-documents-and-data-brief.js');

exports._parent = require('./user');
exports._match = 'businessProcess';

exports['user-account-data'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessProcesses = this.user.initialBusinessProcesses.filterByKey('isSubmitted', true);

	insert(_if(gt(businessProcesses._size, 1), function () {
		var businessSelect;
		var result = [div({ class: "section-primary-sub-small" },
			p({ class: 'section-primary-legend' }, label({ for: 'business-process-select' },
				_("Please select an entity in the selector below to display it documents and data"))),
			p({ class: 'user-account-selector' },
				businessSelect = select({ id: 'business-process-select' },
					option({ value: '/', selected: eq(loc._pathname, '/') },
						_("Select an entity to display its documents and data")),
					list(businessProcesses, function (process) {
						option({
							value: '/requests/' + process.__id__ + '/',
							selected: eq(loc._pathname, '/requests/' + process.__id__ + '/')
						}, process._businessName);
					}))))];
		businessSelect.setAttribute('onchange', 'location.href = this.value + ' +
			'\'#business-process-summary\'');
		businessSelect.onchange = function (ev) { loc.goto(ev.target.value); };
		return result;
	}, function () {
		return mmap(businessProcesses._first, function (businessProcess) {
			if (!businessProcess) return p(_('No requests started'));
			return documentsAndDataBrief(businessProcess);
		});
	}));
	div({ id: 'user-requests-preview' });
};
