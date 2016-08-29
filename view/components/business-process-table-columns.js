'use strict';

var _                     = require('mano').i18n.bind('View: Component: Business Process table')
  , certificateStatusMeta = require('mano').db.CertificateStatus.meta
  , formatLastModified    = require('../utils/last-modified');

var generateCertificatesList = (function () {
	var getStatusLabel = function (cert) {
		if (cert._status) return _if(cert._status, ["- ", cert._status]);
		return cert.status && ("- " + certificateStatusMeta[cert.status].label);
	};
	var resolveStatusClass = function (status) {
		if (!status) return;
		if (status === 'pending') return 'ready';
		return status;
	};
	var getStatusClass = function (cert) {
		if (cert._status) return cert._status.map(resolveStatusClass);
		return resolveStatusClass(cert.status);
	};
	return function (certificates) {
		return span(list(certificates, function (cert) {
			return span({ class: 'hint-optional hint-optional-left',
				'data-hint': [cert.label, getStatusLabel(cert)] },
				span({ class: ['label-reg', getStatusClass(cert)] }, cert.abbr));
		}));
	};
}());

exports.getServiceIcon = function (businessProcess) {
	return i({ class: "fa fa-user" });
};

exports.actionsColumn = {
	class: 'actions',
	noWrap: true,
	data: function (businessProcess) {
		return _if(and(businessProcess._isAtDraft, not(businessProcess._isSubmitted)), postButton({
			buttonClass: 'actions-delete',
			action: url('business-process', businessProcess.__id__, 'delete'),
			confirm: _("Are you sure?"),
			value: span({
				class: 'hint-optional hint-optional-left',
				'data-hint': _('Delete')
			}, i({ class: 'fa fa-trash-o' }))
		}));
	}
};

exports.archiverColumn = {
	class: 'submitted-user-data-table-link',
	noWrap: true,
	data: function (businessProcess) {
		return _if(businessProcess._filesArchiveUrl,
			a({ class: 'hint-optional hint-optional-left', target: "_blank",
				'data-hint': _("Download the electronic file"),
				download: businessProcess._filesArchiveUrl.map(function (name) {
					if (!name) return;
					return name.slice(1);
				}),
				href: businessProcess._filesArchiveUrl },
				span({ class: 'fa fa-download' }, _("Download"))));
	}
};

exports.servicesColumn = {
	head: _("Service"),
	class: 'submitted-user-data-table-service',
	data: function (businessProcess) {
		return span({ class: 'hint-optional hint-optional-right', 'data-hint': businessProcess._label },
			exports.getServiceIcon(businessProcess));
	}
};

exports.businessNameColumn = {
	head: _("Entity"),
	data: function (businessProcess) { return businessProcess._businessName; }
};

exports.submissionDateColumn = {
	head: _("Submission date"),
	class: 'submitted-user-data-table-date',
	data: function (businessProcess) {
		var isSubmitted = businessProcess._isSubmitted;

		return _if(isSubmitted, function () {
			return isSubmitted._lastModified.map(formatLastModified);
		});
	}
};

exports.withdrawalDateColumn = {
	head: _("Withdraw date"),
	class: 'submitted-user-data-table-date',
	data: function (businessProcess) {
		var isApproved = businessProcess._isApproved;

		return _if(isApproved, function () {
			return isApproved._lastModified.map(formatLastModified);
		});
	}
};

exports.certificatesListColumn = {
	head: _("Inscriptions and controls"),
	data: function (businessProcess) {
		return mmap(businessProcess._isClosed, function (isClosed) {
			if (!businessProcess.certificates) return;
			if (isClosed) {
				return mmap(businessProcess.certificates.dataSnapshot._resolved, function (certificates) {
					if (!certificates) return;
					return generateCertificatesList(certificates);
				});
			}
			return mmap(businessProcess.certificates._applicable, function (certificates) {
				if (!certificates) return;
				return generateCertificatesList(certificates);
			});
		});
	}
};

exports.columns = [
	exports.servicesColumn,
	exports.businessNameColumn,
	exports.submissionDateColumn,
	exports.withdrawalDateColumn,
	exports.certificatesListColumn
];
