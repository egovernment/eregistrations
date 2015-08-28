// User: Chosen business process main display

'use strict';

var _ = require('mano').i18n.bind('View: Business process summary');

exports._parent = require('./user');
exports._match = 'businessProcess';

exports.preview = function () {
	var businessProcess = this.businessProcess;
	return div(
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
								th({ class: 'submitted-user-data-table-issue-date' }, _("Edit date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: 3 }, _("No data"))) },
							businessProcess.dataForms.processChainApplicable, function (section) {
								tr(
									td(section._label),
									td({ class: 'submitted-user-data-table-issue-date' },
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
};
