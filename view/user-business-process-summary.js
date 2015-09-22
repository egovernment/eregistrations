// User: Chosen business process main display

'use strict';

var _ = require('mano').i18n.bind('View: Business process summary'),
	loc = require('mano/lib/client/location');

exports._parent = require('./user');
exports._match = 'businessProcess';

exports['user-account-data'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessProcess = this.businessProcess;
	var businessSelect;
	section({ class: "section-primary user-doc-data" },
		div({ class: "section-primary-sub" },
			p(_("Please select an entity in the selector below to display it documents and data")),
			businessSelect = select({ id: 'business-process-select' },
				option({ value: '/', selected: eq(loc._pathname, '/') },
					_("Select an entity to display its documents and data")),
				list(this.user.initialBusinessProcesses, function (process) {
					option({
						value: '/business-process/' + process.__id__ + '/',
						selected: eq(loc._pathname, '/business-process/' + process.__id__ + '/')
					},
						process._businessName);
				}))),
		div({ class: "section-primary-sub" },
			h3(_("Documents")),
			require('./_user-business-process-documents-list')(
				businessProcess.documents.processChainUploaded.toArray().slice(0, 5)
			),
			p(a({ href: '/business-process/' + businessProcess.__id__ + '/documents/',
					class: 'button-regular' },
				_("See all documents"))),

			div({ class: "section-primary-sub" },
				h3(_("Data")),
				div({ class: "table-responsive-container" },
					table({ class: 'submitted-user-data-table ' +
							'submitted-current-user-data-table user-request-table' },
						thead(
							tr(
								th(_("Section")),
								th({ class: 'submitted-user-data-table-date' }, _("Edit date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: 3 }, _("No data"))) },
							businessProcess.dataForms.processChainApplicable, function (section) {
								tr(
									td(section._label),
									td({ class: 'submitted-user-data-table-date' },
										section._lastEditDate.map(function (date) {
											return date.toLocaleDateString();
										})),
									td({ class: 'submitted-user-data-table-link' },
										a({ href: '/business-process/' + businessProcess.__id__ + '/data/' },
											span({ class: 'fa fa-search' }, _("Go to"))))
								);
							}))),
				p(a({ href: '/business-process/' + businessProcess.__id__ + '/data/',
						class: 'button-regular' },
						_("See all data")))))
		);
	businessSelect.setAttribute('onchange', 'location.href = this.value + ' +
		'\'#business-process-summary\'');
	businessSelect.onchange = function (ev) {
		loc.goto(ev.target.value);
	};
};
