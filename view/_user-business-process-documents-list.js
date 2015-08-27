// User: Chosen business process main display documents

'use strict';

var _ = require('mano').i18n.bind('View: Documents list')
, Institution = require('mano').db.Institution
, resolveIssuer = require('./utils/issuer-resolver')
, camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

module.exports = function (documents) {
	return div({ class: "table-responsive-container" },
		table({ class: "submitted-user-data-table submitted-current-user-data-table" },
			thead(tr(th(), th(_("Name")), th(_("Issuer")),
				th(_("Issue date")), th())),
			tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: 5 }, _("No documents"))) },
				documents, function (doc) {
					var url = '/business-process/' + doc.master.__id__ + '/';

					if (doc.owner.owner.key === 'certificates') {
						url += 'certificate/' + camelToHyphen.call(doc.key) + '/';
					} else if (doc.owner.owner.owner.key === 'requirementUploads') {
						url += 'document/' + camelToHyphen.call(doc.uniqueKey) + '/';
					} else if (doc.owner.owner.owner.key === 'paymentReceiptUploads') {
						url += 'receipt/' + camelToHyphen.call(doc.owner.key) + '/';
					} else {
						throw new Error("Unrecognized document");
					}

					tr(
						td({ class: doc._issuedBy.map(function (val) {
							if (val.constructor === Institution) return "icon";
						}) }, span({ class: 'fa fa-certificate' })),
						td(doc._label),
						td(doc._issuedBy.map(resolveIssuer)),
						td(doc._issueDate),
						td({ class: 'user-doc-data-table-actions' }, a({ href: url },
							span({ class: 'fa fa-search' }, _("Go to"))))
					);
				})));
};
