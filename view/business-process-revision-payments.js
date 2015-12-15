// Documents list and user data

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted');

exports._parent = require('./business-process-revision');

exports['official-revision-payments'] = { class: { active: true } };
exports['official-revision-content'] = function (businessProcess/*, options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/';

	return [section({ class: 'section-primary' },
		_if(businessProcess.paymentReceiptUploads.applicable._size,
			[h3(_("Payment receipts")),
				div(
					{ class: 'table-responsive-container' },
					table(
						{ class: 'submitted-user-data-table user-request-table' },
						thead(
							tr(
								th({ class: 'submitted-user-data-table-status' }),
								th(_("Name")),
								th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody(
							businessProcess.paymentReceiptUploads.applicable,
							function (receipt) {
								td({ class: 'submitted-user-data-table-status' },
									_if(receipt._isApproved, span({ class: 'fa fa-check' })),
										_if(receipt._isRejected, span({ class: 'fa fa-exclamation' })));
								td(receipt.document.label);
								td({ class: 'submitted-user-data-table-date' }, receipt.document._issueDate);
								td({ class: 'submitted-user-data-table-link' },
									a({ href: urlPrefix + 'receipt/' + camelToHyphen.call(receipt.key) + "/" },
										span({ class: 'fa fa-search' }, _("Go to"))));
							}
						)
					)
				)]))];
};
