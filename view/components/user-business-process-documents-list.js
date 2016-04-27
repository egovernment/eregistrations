// User: Chosen business process main display documents

'use strict';

var _             = require('mano').i18n.bind('View: Component: Documents')
  , resolveIssuer = require('../utils/issuer-resolver')

  , _d = _;

module.exports = function (documents) {
	return div({ class: "table-responsive-container" },
		table({ class: 'submitted-user-data-table user-request-table' },
			thead(
				tr(
					th({ class: 'submitted-user-data-table-status' }),
					th(_("Name")),
					th(_("Issuer")),
					th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
					th({ class: 'submitted-user-data-table-link' })
				)
			),
			tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: 5 }, _("No documents"))) },
				documents, function (doc) {
					tr(
						td({ class: 'submitted-user-data-table-status' },
							doc.isCertificate ? span({ class: 'fa fa-certificate' }) : null),
						td(doc._label.map(function (label) { return _d(label, doc.getTranslations()); })),
						td(doc._issuedBy.map(resolveIssuer)),
						td({ class: 'submitted-user-data-table-date' }, doc._issueDate),
						td({ class: 'submitted-user-data-table-link' },
							a({ href: '/business-process/' + doc.master.__id__ + doc.docUrl },
								span({ class: 'fa fa-search' }, _("Go to"))))
					);
				})));
};
