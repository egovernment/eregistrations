// User: Chosen business process main display documents and data

'use strict';

var _                   = require('mano').i18n.bind('View: Component: Documents and data')
  , renderDocumentsList = require('./user-business-process-documents-list');

module.exports = function (businessProcess) {
	return [
		div({ class: "section-primary-sub user-account-content-selector" },
			h2(_("Documents")),
			p({ class: 'section-primary-legend' },
				_("Here you can see documents that you uploaded as part of the application and the " +
					"certificates issued in the process.")),
			renderDocumentsList(businessProcess, { limit: 5 }),
			p({ class: 'section-primary-sub-action' },
				a({ href: '/business-process/' + businessProcess.__id__ + '/documents/',
					class: 'button-regular' },
					_("See all documents")))),
		div({ class: "section-primary-sub" },
			h2(_("Data")),
			p({ class: 'section-primary-legend' },
				_("You can see here all the information you have provided for the application.")),
			div({ class: "table-responsive-container" },
				table({ class: 'submitted-user-data-table user-request-table' },
					thead(
						tr(
							th(_("Section")),
							th({ class: 'submitted-user-data-table-date' }, _("Edit date")),
							th({ class: 'submitted-user-data-table-link' })
						)
					),
					tbody(mmap(businessProcess.dataForms.dataSnapshot._resolved, function (data) {
						if (!data) return tr({ class: 'empty' }, td({ colspan: 3 }, _("No data")));
						return data.map(function (sectionData) {
							return tr(
								td(sectionData.label),
								td({ class: 'submitted-user-data-table-date' }, sectionData.lastEditDate),
								td({ class: 'submitted-user-data-table-link' },
									a({ href: '/business-process/' + businessProcess.__id__ + '/data/' },
										span({ class: 'fa fa-search' }, _("Go to"))))
							);
						});
					})))),
			p({ class: 'section-primary-sub-action' },
				a({ href: '/business-process/' + businessProcess.__id__ + '/data/',
					class: 'button-regular' },
					_("See all data"))))];
};
