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
				businessProcess.cumulatedDocuments.toArray().slice(0, 5)
			),
			p(a({ href: '/business-process/' + businessProcess.__id__ + '/documents/',
					class: 'button-regular' },
				_("See all documents"))),

			div({ class: "section-primary-sub" },
				h3(_("Data")),
				div({ class: "table-responsive-container" },
					table({ class: "submitted-user-data-table submitted-current-user-data-table" },
						thead(tr(th(_("Section")), th(_("Edit date")), th())),
						tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: 3 }, _("No data"))) },
							businessProcess.dataForms.processChainApplicable, function (section) {
								tr(
									td(section._label),
									td(section._lastEditDate.map(function (date) {
										return date.toLocaleDateString();
									})),
									td({ class: 'user-doc-data-table-actions' },
										a({ href: '/business-process/' + businessProcess.__id__ + '/data/' },
											span({ class: 'fa fa-search' }, _("Go to"))))
								);
							}))),
				p(a({ href: '/business-process/' + businessProcess.__id__ + '/data/',
						class: 'button-regular' },
						_("See all data")))))
	);
};
