// Documents list and user data

'use strict';

var camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , _              = require('mano').i18n.bind('User Submitted')
  , renderSections = require('./components/render-sections-json')

  , _d = _;

var drawDocumentsPart = function (target, urlPrefix) {
	return _if(target.requirementUploads.applicable._size, [
		h3(_("Documents required")),
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th(_("Name")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.requirementUploads.applicable,
					function (requirementUpload) {
						td(
							{ class: 'submitted-user-data-table-status' },
							_if(requirementUpload._isApproved, span({ class: 'fa fa-check' })),
							_if(requirementUpload._isRejected, span({ class: 'fa fa-exclamation' }))
						);
						td(_d(requirementUpload.document._label, requirementUpload.document.getTranslations()));
						td(requirementUpload.document._issuedBy);
						td({ class: 'submitted-user-data-table-date' }, requirementUpload.document._issueDate);
						td({ class: 'submitted-user-data-table-link' },
							a({ href: urlPrefix + 'document/' +
								camelToHyphen.call(requirementUpload.document.uniqueKey) + "/" },
								span({ class: 'fa fa-search' }, _("Go to"))));
					}
				)
			)
		)
	]);
};

var drawPaymentReceiptsPart = function (target, urlPrefix) {
	return _if(target.paymentReceiptUploads.applicable._size, [
		h3(_("Payment receipts")),
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
					target.paymentReceiptUploads.applicable,
					function (receipt) {
						td(
							{ class: 'submitted-user-data-table-status' },
							_if(receipt._isApproved, span({ class: 'fa fa-check' })),
							_if(receipt._isRejected, span({ class: 'fa fa-exclamation' }))
						);
						td(receipt.document.label);
						td({ class: 'submitted-user-data-table-date' }, receipt.document._issueDate);
						td({ class: 'submitted-user-data-table-link' },
							a({ href: urlPrefix + 'receipt/' + camelToHyphen.call(receipt.key) + "/" },
								span({ class: 'fa fa-search' }, _("Go to"))));
					}
				)
			)
		)
	]);
};

var drawCertificatesPart = function (target, urlPrefix) {
	return _if(target.certificates.uploaded._size, [
		h3(_("Certificates")),
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th(_("Name")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Number")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.certificates.uploaded,
					function (certificate) {
						td({ class: 'submitted-user-data-table-status' },
							span({ class: 'fa fa-certificate' }));
						td(certificate.label);
						td(certificate._issuedBy);
						td({ class: 'submitted-user-data-table-date' }, certificate._issueDate);
						td(certificate._number);
						td({ class: 'submitted-user-data-table-link' },
							a({ href: urlPrefix + 'certificate/' +
								camelToHyphen.call(certificate.key) + '/' },
								span({ class: 'fa fa-search' }, _("Go to"))));
					}
				)
			)
		)
	]);
};

module.exports = exports = function (businessProcess/*, options*/) {
	var options         = Object(arguments[1])
	  , urlPrefix       = options.urlPrefix || '/'
	  , uploadsResolver = options.uploadsResolver || businessProcess;

	return [
		section(
			{ class: 'section-primary' },
			h2(_("Documents")),
			drawDocumentsPart(uploadsResolver, urlPrefix),
			drawPaymentReceiptsPart(uploadsResolver, urlPrefix),
			drawCertificatesPart(uploadsResolver, urlPrefix)
		),
		section(
			{ class: 'section-primary entity-data-section-side' },
			h2(
				{ class: 'container-with-nav' },
				_("Form data"),
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': _("Print your application form"), href: urlPrefix + 'data-print/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print"))
				)
			),
			renderSections(businessProcess.dataForms.dataSnapshot)
		)
	];
};
