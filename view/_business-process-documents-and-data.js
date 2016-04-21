// Documents list and user data

'use strict';

var find           = require('es5-ext/array/#/find')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , _              = require('mano').i18n.bind('User Submitted')
  , renderSections = require('./components/render-sections-json')
  , getSetProxy    = require('../utils/observable-set-proxy')

  , _d = _;

var resolveUploads = function (targetMap) {
	var target = targetMap.owner, businessProcess = target.master;
	var kind = (targetMap.key === 'requirementUploads')
		? 'requirementUpload' : 'paymentReceiptUpload';
	var snapshot = (kind === 'requirementUpload') ? businessProcess.requirementUploads.dataSnapshot
		: businessProcess.paymentReceiptUploads.dataSnapshot;
	if (target === businessProcess) return snapshot._resolved;
	return snapshot._resolved.map(function (data) {
		return getSetProxy(targetMap.applicable).map(function (upload) {
			var uniqueKey = (kind === 'requirementUpload') ? upload.document.uniqueKey : upload.key;
			var snapshot = data && find.call(data, function (snapshot) {
				return uniqueKey === snapshot.uniqueKey;
			});
			if (snapshot) return snapshot;
			if (!targetMap.processable) return;
			if (!targetMap.processable.has(upload)) return;
			return upload.enrichJSON(upload.toJSON());
		}).filter(Boolean).toArray();
	});
};

var resolveCertificates = function (targetMap) {
	var target = targetMap.owner, businessProcess = target.master;
	if (target === businessProcess) return businessProcess.certificates.dataSnapshot._resolved;
	return businessProcess._isApproved.map(function (isApproved) {
		if (!isApproved) return targetMap.uploaded.toArray();
		return businessProcess.certificates.dataSnapshot._resolved.map(function (data) {
			if (!data) return;
			return getSetProxy(targetMap.uploaded).map(function (certificate) {
				var snapshot = find.call(data, function (snapshot) {
					return certificate.key === snapshot.uniqueKey;
				});
				if (snapshot) return snapshot;
			}).filter(Boolean).toArray();
		});
	});
};

var drawDocumentsPart = function (target, urlPrefix) {
	return mmap(resolveUploads(target.requirementUploads), function (data) {
		if (!data || !data.length) return;
		return [
			h3(_("Documents required")),
			div({ class: 'table-responsive-container' },
				table({ class: 'submitted-user-data-table user-request-table' },
					thead(tr(th({ class: 'submitted-user-data-table-status' }),
						th(_("Name")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th({ class: 'submitted-user-data-table-link' }))),
					tbody(data, function (uploadData) {
						return tr(
							td({ class: 'submitted-user-data-table-status' },
								_if(eq(uploadData.status, 'approved'), span({ class: 'fa fa-check' })),
								_if(eq(uploadData.status, 'rejected'), span({ class: 'fa fa-exclamation' }))),
							td(uploadData.label),
							td(uploadData.issuedBy),
							td({ class: 'submitted-user-data-table-date' }, uploadData.issueDate),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: urlPrefix + 'document/' +
									camelToHyphen.call(uploadData.uniqueKey) + "/" },
									span({ class: 'fa fa-search' }, _("Go to"))))
						);
					})))
		];
	});
};

var drawPaymentReceiptsPart = function (target, urlPrefix) {
	return mmap(resolveUploads(target.paymentReceiptUploads), function (data) {
		if (!data || !data.length) return;
		return [
			h3(_("Payment receipts")),
			div({ class: 'table-responsive-container' },
				table({ class: 'submitted-user-data-table user-request-table' },
					thead(tr(th({ class: 'submitted-user-data-table-status' }),
						th(_("Name")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th({ class: 'submitted-user-data-table-link' }))),
					tbody(data, function (uploadData) {
						return tr(
							td({ class: 'submitted-user-data-table-status' },
								_if(eq(uploadData.status, 'approved'), span({ class: 'fa fa-check' })),
								_if(eq(uploadData.status, 'rejected'), span({ class: 'fa fa-exclamation' }))),
							td(uploadData.label),
							td({ class: 'submitted-user-data-table-date' }, uploadData.issueDate),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: urlPrefix + 'receipt/' + camelToHyphen.call(uploadData.uniqueKey) + "/" },
									span({ class: 'fa fa-search' }, _("Go to"))))
						);
					})))
		];
	});
};

var drawCertificatesPart = function (target, urlPrefix) {
	return mmap(resolveCertificates(target.certificates), function (data) {
		if (!data || !data.length) return;
		return [
			h3(_("Certificates")),
			div({ class: 'table-responsive-container' },
				table({ class: 'submitted-user-data-table user-request-table' },
					thead(tr(th({ class: 'submitted-user-data-table-status' }),
						th(_("Name")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Number")),
						th({ class: 'submitted-user-data-table-link' }))),
					tbody(data, function (certificate) {
						var data = certificate;
						if (certificate.__id_) {
							data = {
								label: certificate._label.map(function (label) {
									return _d(label, certificate.getTranslations());
								}),
								issuedBy: certificate._issuedBy,
								issueDate: certificate._issueDate,
								number: certificate._number,
								uniqueKey: certificate.key
							};
						}
						return tr(
							td({ class: 'submitted-user-data-table-status' },
								span({ class: 'fa fa-certificate' })),
							td(data.label),
							td(data.issuedBy),
							td({ class: 'submitted-user-data-table-date' }, data.issueDate),
							td(data.number),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: urlPrefix + 'certificate/' + camelToHyphen.call(data.uniqueKey) + '/' },
									span({ class: 'fa fa-search' }, _("Go to"))))
						);
					})))
		];
	});
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
