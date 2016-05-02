// Payment receipt uploads list

'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('View: Component: Payments')
  , getUploads       = require('../utils/get-uploads-list');

module.exports = function (context/*, options*/) {
	var options               = normalizeOptions(arguments[1])
	  , businessProcess       = context.businessProcess
	  , urlPrefix             = options.urlPrefix || '/'
	  , target                = options.uploadsResolver || businessProcess
	  , paymentReceiptUploads = getUploads(target.paymentReceiptUploads, context.appName);

	return mmap(paymentReceiptUploads, function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
			return div({ class: 'table-responsive-container' },
				table({
					class: 'submitted-user-data-table user-request-table',
					configuration: {
						collection: paymentReceiptUploads,
						columns: [{
							class: 'submitted-user-data-table-status',
							data: function (upload) {
								return [
									_if(eq(upload.status, 'approved'), span({ class: 'fa fa-check' })),
									_if(eq(upload.status, 'rejected'), span({ class: 'fa fa-exclamation' }))
								];
							}
						}, {
							class: 'submitted-user-data-table-label',
							head: _("Payment receipts"),
							data: function (upload) { return upload.label; }
						}, {
							class: 'submitted-user-data-table-date',
							head: _("Emission date"),
							data: function (upload) { return upload.issueDate; }
						}, {
							head: _("Emissor"),
							data: _("User")
						}, {
							class: 'submitted-user-data-table-link',
							data: function (upload) {
								return a({ href: urlPrefix + 'payment-receipts/' +
									camelToHyphen.call(upload.uniqueKey) + '/' },
									span({ class: 'fa fa-search' }, _("Go to")));
							}
						}],
						rowAttributes: function (upload) {
							return { id: 'receipt-item-' + camelToHyphen.call(upload.uniqueKey) };
						}
					}
				}));
		});
	});
};
