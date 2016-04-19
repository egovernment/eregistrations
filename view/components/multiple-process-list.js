// Generic list for multiple process collection

'use strict';

var _  = require('mano').i18n.bind('User Submitted')
  , _d = _;

module.exports = function (collection, label, options) {
	var urlPrefix = options.urlPrefix || '/';

	return _if(collection._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th({ class: 'submitted-user-data-table-label' }, label),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					collection,
					function (upload) {
						var isCertificate = upload.owner.owner.key === 'certificates'
						  , doc           = isCertificate ? upload : upload.document;

						return tr(
							{ id: 'document-item-' + doc.docId },
							td(
								{ class: 'submitted-user-data-table-status' },
								isCertificate ? span({ class: 'fa fa-certificate' }) : [
									_if(upload._isApproved, span({ class: 'fa fa-check' })),
									_if(upload._isRejected, span({ class: 'fa fa-exclamation' }))
								]
							),
							td({ class: 'submitted-user-data-table-label' },
								_d(doc.label, doc.getTranslations())),
							td({ class: 'submitted-user-data-table-date' }, doc._issueDate),
							td(doc._issuedBy),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: urlPrefix + doc.docUrl },
									span({ class: 'fa fa-search' }, _("Go to"))))
						);
					}
				)
			)
		)
	]);
};
