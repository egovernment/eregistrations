// Documents list

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted')
  , _d = _;

module.exports = function (businessProcess, options) {
	var target = options.uploadsResolver || businessProcess
	  , urlPrefix = options.urlPrefix || '/';
	return _if(target.paymentReceiptUploads.applicable._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th({ class: 'submitted-user-data-table-label' }, _("Payment receipts")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.paymentReceiptUploads.applicable,
					function (receipt) {
						return tr({ id: 'document-item-' +
							camelToHyphen.call(receipt.document.key) },
								td(
								{ class: 'submitted-user-data-table-status' },
								_if(receipt._isApproved, span({ class: 'fa fa-check' })),
								_if(receipt._isRejected, span({ class: 'fa fa-exclamation' }))
							),
							td({ class: 'submitted-user-data-table-label' },
								_d(receipt.document.label, receipt.document.getTranslations())),
							td({ class: 'submitted-user-data-table-date' }, receipt.document._issueDate),
							td(receipt.document._issuedBy),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: urlPrefix + receipt.document.docUrl },
									span({ class: 'fa fa-search' }, _("Go to"))))
							);
					}
				)
			)
		)
	]);
};
