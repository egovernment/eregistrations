// Documents list and user data

'use strict';

var find            = require('es5-ext/array/#/find')
  , camelToHyphen   = require('es5-ext/string/#/camel-to-hyphen')
  , ObservableValue = require('observable-value')
  , _               = require('mano').i18n.bind('User Submitted')
  , renderSections  = require('./components/render-sections-json');

var resolveUploads = function (targetCollection) {
	var target = targetCollection.owner, businessProcess = target.master;
	if (target === businessProcess) return targetCollection.dataSnapshot._resolved;
	return targetCollection.dataSnapshot._resolved.map(function (data) {
		var observable = new ObservableValue();
		var update = function () {
			var result = [];
			targetCollection.applicable.forEach(function (upload) {
				var uploadData = find.call(data, function (uploadData) {
					return upload.document.uniqueKey === uploadData.uniqueKey;
				});
				if (uploadData) {
					result.push(uploadData);
					return;
				}
				if (!targetCollection.processable) return;
				if (!targetCollection.processable.has(upload)) return;
				uploadData = upload.toJSON();
				uploadData.status = upload._isApproved.map(function (isApproved) {
					if (isApproved) return 'approved';
					return upload._isRejected.map(function (isRejected) {
						if (isRejected) return 'rejected';
					});
				});
				uploadData.statusLog = upload.statusLog.ordered;
				result.push(uploadData);
			});
			observable.value = result;
		};
		targetCollection.applicable.on('change', update);
		update();
		return observable;
	});
};

var resolveCertificates = function (targetCollection) {
	var target = targetCollection.owner, businessProcess = target.master;
	if (target === businessProcess) return targetCollection.dataSnapshot._resolved;
	return businessProcess._isApproved.map(function (isApproved) {
		if (!isApproved) return targetCollection.uploaded;
		return targetCollection.dataSnapshot._resolved.map(function (data) {
			var observable = new ObservableValue();
			var update = function () {
				var result = [];
				targetCollection.uploaded.forEach(function (upload) {
					var uploadData = find.call(data, function (certData) {
						return upload.key === certData.uniqueKey;
					});
					if (uploadData) {
						result.push(uploadData);
						return;
					}
				});
				observable.value = result;
			};
			targetCollection.applicable.on('change', update);
			update();
			return observable;
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
								a({ href: urlPrefix + 'receipt/' + camelToHyphen.call(uploadData.key) + "/" },
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
						return tr(
							td({ class: 'submitted-user-data-table-status' },
								span({ class: 'fa fa-certificate' })),
							td(certificate.label),
							td(certificate.issuedBy),
							td({ class: 'submitted-user-data-table-date' }, certificate.issueDate),
							td(certificate.number),
							td({ class: 'submitted-user-data-table-link' },
								a({ href: urlPrefix + 'certificate/' + camelToHyphen.call(certificate.key) + '/' },
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
