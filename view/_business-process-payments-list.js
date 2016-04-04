// Documents list

'use strict';

var _                = require('mano').i18n.bind('User Submitted');

module.exports = function (target, urlPrefix, selectedDocumentId) {
	return _if(target.paymentReceiptUploads.applicable._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th(_("Payment receipts")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.paymentReceiptUploads.applicable,
					function (receipt) {
						var rowClass = (selectedDocumentId
								&& receipt.document.__id__ === selectedDocumentId) ?
									'active' : '';
						return tr({ class: rowClass },
								td(
								{ class: 'submitted-user-data-table-status' },
								_if(receipt._isApproved, span({ class: 'fa fa-check' })),
								_if(receipt._isRejected, span({ class: 'fa fa-exclamation' }))
							),
							td(receipt.document._label),
							td({ class: 'submitted-user-data-table-date' }, receipt.document._issueDate),
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
