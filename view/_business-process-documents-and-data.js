// Documents list and user data

'use strict';

var find           = require('es5-ext/array/#/find')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , _              = require('mano').i18n.bind('User Submitted')
  , renderSections = require('./components/render-sections-json')
  , getSetProxy    = require('../utils/observable-set-proxy')

  , _d = _;

var resolveUploads = function (context, targetMap) {
	var target = targetMap.owner, businessProcess = target.master;
	var kind = (targetMap.key === 'requirementUploads')
		? 'requirementUpload' : 'paymentReceiptUpload';
	var snapshot = (kind === 'requirementUpload') ? businessProcess.requirementUploads.dataSnapshot
		: businessProcess.paymentReceiptUploads.dataSnapshot;

	// If it's a user, then we show to him direct result of saved snapshot
	if (context.user.currentRoleResolved === 'user') return snapshot._resolved;

	// Otherwise we show only those items from snapshot which are applicable according
	// to current model state.
	// Additionally for revision case we show processable items even if they're not
	// represented in snapshot
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

var resolveCertificates = function (context, targetMap) {
	var target = targetMap.owner, businessProcess = target.master;
	return businessProcess._isApproved.map(function (isApproved) {
		if (!isApproved) {
			// User, can see released certificates only when request is finalized
			if (context.user.currentRoleResolved === 'user') return null;
			return targetMap.released.toArray();
		}
		if (context.user.currentRoleResolved === 'user') {
			// For user we show certificates as they're stored in snapshot
			return businessProcess.certificates.dataSnapshot._resolved;
		}
		// For officials we show only those certificates from snapshot which are applicable
		// to be exposed to him
		return businessProcess.certificates.dataSnapshot._resolved.map(function (data) {
			if (!data) return;
			return getSetProxy(targetMap.released).map(function (certificate) {
				var snapshot = find.call(data, function (snapshot) {
					return certificate.key === snapshot.uniqueKey;
				});
				if (snapshot) return snapshot;
			}).filter(Boolean).toArray();
		});
	});
};

var drawDocumentsPart = function (context, target, urlPrefix) {
	return mmap(resolveUploads(context, target.requirementUploads), function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
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
	});
};

var drawPaymentReceiptsPart = function (context, target, urlPrefix) {
	return mmap(resolveUploads(context, target.paymentReceiptUploads), function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
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
									a({ href: urlPrefix + 'receipt/' + camelToHyphen.call(uploadData.uniqueKey) +
										"/" }, span({ class: 'fa fa-search' }, _("Go to"))))
							);
						})))
			];
		});
	});
};

var drawCertificatesPart = function (context, target, urlPrefix) {
	return mmap(resolveCertificates(context, target.certificates), function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
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
	});
};

var dataFormsRevisionControls = function (context) {
	var businessProcess = context.businessProcess
	  , processingStep  = context.processingStep
	  , dataForms       = businessProcess.dataForms
	  , revReason;

	if (!processingStep) return;
	if (!(processingStep.dataFormsRevision && processingStep.dataFormsRevision.isProcessable)) return;

	return form(
		{
			id: 'form-revision-data-forms',
			action: '/revision-data-forms/' + businessProcess.__id__ + '/',
			method: 'post',
			class: 'submitted-preview-form'
		},
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: dataForms._status }))),
			li(
				revReason = div({ class: 'official-form-data-forms-revision-reject-reason' },
					field({ dbjs: dataForms._rejectReason }))
			)
		),
		p(input({ type: 'submit', value: _("Save") })),
		legacy('radioMatch', 'form-revision-data-forms',
			dataForms.__id__ + '/status', { rejected: revReason.getId() })
	);
};

var dataFormsRevisionInfo = function (context) {
	var snapshot = context.dataSnapshot;

	return _if(eq(snapshot.status, 'rejected'), div({ class: 'section-secondary info-main' },
		p(_("Data forms were rejected for the following reason(s)"), ': ', snapshot.rejectReason)));
};

module.exports = exports = function (context/*, options*/) {
	var options         = Object(arguments[1])
	  , urlPrefix       = options.urlPrefix || '/'
	  , uploadsResolver = options.uploadsResolver || context.businessProcess
	  , processingStep  = context.processingStep;

	return [
		section(
			{ class: 'section-primary' },
			h2(_("Documents")),
			drawDocumentsPart(context, uploadsResolver, urlPrefix),
			drawPaymentReceiptsPart(context, uploadsResolver, urlPrefix),
			drawCertificatesPart(context, uploadsResolver, urlPrefix)
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
			(processingStep && processingStep.dataFormsRevision
				&& processingStep.dataFormsRevision.isProcessable) ?
					dataFormsRevisionControls(context) :
					dataFormsRevisionInfo(context),
			renderSections(context.businessProcess.dataForms.dataSnapshot)
		)
	];
};
