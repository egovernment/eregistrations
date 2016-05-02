// Payment receipt uploads list

'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , _                = require('mano').i18n.bind('View: Component: Payments')

  , _d = _;

module.exports = function (businessProcess/*, options*/) {
	var options               = normalizeOptions(arguments[1])
	  , urlPrefix             = options.urlPrefix || '/'
	  , target                = options.uploadsResolver || businessProcess
	  , paymentReceiptUploads = target.paymentReceiptUploads.applicable;

	return _if(paymentReceiptUploads._size, div(
		{ class: 'table-responsive-container' },
		table({ class: 'submitted-user-data-table user-request-table', configuration: {
			collection: paymentReceiptUploads,
			columns: [{
				class: 'submitted-user-data-table-status',
				data: function (upload) {
					return [
						_if(upload._isApproved, span({ class: 'fa fa-check' })),
						_if(upload._isRejected, span({ class: 'fa fa-exclamation' }))
					];
				}
			}, {
				class: 'submitted-user-data-table-label',
				head: _("Payment receipts"),
				data: function (upload) {
					return _d(upload.document.label, upload.document.getTranslations());
				}
			}, {
				class: 'submitted-user-data-table-date',
				head: _("Issue date"),
				data: function (upload) {
					return upload.document._issueDate;
				}
			}, {
				head: _("Issuer"),
				data: function (upload) {
					return "User";
				}
			}, {
				class: 'submitted-user-data-table-link',
				data: function (upload) {
					return a(
						{ href: urlPrefix + upload.document.docUrl },
						span({ class: 'fa fa-search' }, _("Go to"))
					);
				}
			}],
			headRowAttributes: {},
			rowAttributes: function (upload) {
				return { id: 'receipt-item-' + upload.document.docId };
			}
		} })
	));
};
