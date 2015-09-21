// User: Account documents and data view

'use strict';

var _ = require('mano').i18n.bind('User'),
loc     = require('mano/lib/client/location');

exports._parent = require('./user');

exports['user-account-data'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessSelect;
	var businessProcess = this.businessProcess;
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
		div({ id: 'preview' },
			h3(_('Documents')),
			require('./_user-business-process-documents-list')(
				businessProcess.documents.processChainUploaded
			),
			button({ type: 'submit', class: 'button' }, _('See all documents')),
			hr(),
			h3(_('Data')),
			table({ class: 'submitted-user-data-table ' +
				'submitted-current-user-data-table user-request-table' },
				thead(
					tr(
						th(_("Section name")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					tr(
						td('section 1'),
						td({ class: 'submitted-user-data-table-date' }, "12/12/2015"),
						td({ class: 'submitted-user-data-table-link' },
							a({ href: '/business-process/' },
								span({ class: 'fa fa-search' }, _("Go to"))))
					),
					tr(
						td('section 2'),
						td({ class: 'submitted-user-data-table-date' }, "11/11/2015"),
						td({ class: 'submitted-user-data-table-link' },
							a({ href: '/business-process/' },
								span({ class: 'fa fa-search' }, _("Go to"))))
					)
				)
				),
			button({ type: 'submit', class: 'button' }, _('See all data'))
			));
	businessSelect.setAttribute('onchange', 'location.href = this.value + ' +
		'\'#business-process-summary\'');
	businessSelect.onchange = function (ev) {
		loc.goto(ev.target.value);
	};
};
