// User: Chosen business process main display documents

'use strict';

var _ = require('mano').i18n.bind('View: Documents list')
, Institution = require('mano').db.Institution
, resolveIssuer = require('./utils/issuer-resolver');

module.exports = function (documents) {
	return div({ class: "table-responsive-container" },
		table({ class: "submitted-user-data-table submitted-current-user-data-table" },
			thead(tr(th(), th(_("Name")), th(_("Issuer")),
				th(_("Issue date")), th())),
			tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: 5 }, _("No documents"))) },
				documents, function (doc) {
					tr(
						td({ class: doc._issuedBy.map(function (val) {
							if (val.constructor === Institution) return "icon";
						}) }, span({ class: 'fa fa-certificate' })),
						td(doc._label),
						td(doc._issuedBy.map(resolveIssuer)),
						td(doc._issueDate),
						td({ class: 'user-doc-data-table-actions' },
							a({ href: '/business-process/' + doc.master.__id__ + doc.docUrl() },
								span({ class: 'fa fa-search' }, _("Go to"))))
					);
				})));
};
