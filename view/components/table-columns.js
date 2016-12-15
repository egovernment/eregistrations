'use strict';

var db                    = require('../../db')
  , _                     = require('mano').i18n.bind('View: Component: Inspector')
  , someRight             = require('es5-ext/array/#/some-right')
  , timeRanges            = require('../../utils/supervisor-time-ranges')
  , formatLastModified    = require('../utils/last-modified')

  , certificateStatusMeta = db.CertificateStatus.meta;

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

exports.businessProcessSubmitterTypeColumn = {
	head: _("User type"),
	data: function (businessProcess) {
		return mmap(businessProcess._submitterType, function (submitterType) {
			if (!businessProcess.submitterType) return;

			return db.BusinessProcess.prototype.getDescriptor('submitterType')
				.type.meta[submitterType].label;
		});
	}
};

exports.businessProcessStatusColumn = {
	head: _("Status"),
	data: function (businessProcess) {
		if (!businessProcess.status) return;

		return db.BusinessProcessStatus.meta[businessProcess.status].label;
	}
};

exports.businessProcessServiceColumn = {
	head: _("Service"),
	class: 'submitted-user-data-table-service',
	data: function (businessProcess) {
		return span({ class: 'hint-optional hint-optional-right', 'data-hint': businessProcess._label },
			exports.getServiceIcon(businessProcess));
	}
};

exports.businessProcessBusinessNameColumn = {
	head: _("Entity"),
	data: function (businessProcess) {
		return businessProcess._businessName;
	}
};

exports.businessProcessCertificatesListColumn = {
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

exports.businessProcessCreationDateColumn = {
	head: _("Creation date"),
	data: function (businessProcess) {
		return formatLastModified(businessProcess.lastModified);
	}
};

exports.businessProcessSubmissionDateColumn = {
	head: _("Submission date"),
	class: 'submitted-user-data-table-date',
	data: function (businessProcess) {
		var isSubmitted = businessProcess._isSubmitted;

		return _if(isSubmitted, function () {
			return isSubmitted._lastModified.map(formatLastModified);
		});
	}
};

exports.businessProcessWithdrawalDateColumn = {
	head: _("Withdraw date"),
	class: 'submitted-user-data-table-date',
	data: function (businessProcess) {
		var isApproved = businessProcess._isApproved;

		return _if(isApproved, function () {
			return isApproved._lastModified.map(formatLastModified);
		});
	}
};

exports.businessProcessActionsColumn = {
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

exports.businessProcessArchiverColumn = {
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

exports.processingStepBusinessNameColumn = {
	head: _("Name"),
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return businessProcess._businessName;
	}
};

exports.processingStepRoleColumn = {
	head: _("Role"),
	data: function (processingStep) {
		var assignee = processingStep._assignee;

		return [
			processingStep._label,
			_if(assignee, [' ', span('(', assignee, ')')])
		];
	}
};

exports.processingStepProcessingTimeColumn = {
	head: _("Time"),
	data: function (processingStep) {
		var result, value;
		return processingStep._status._lastModified.map(function (modDate) {
			value = Date.now() - (modDate / 1000);
			if (!timeRanges[1] || value < timeRanges[1].value) {
				result = _("Recent");
			} else {
				someRight.call(timeRanges, function (item) {
					if (value >= item.value) {
						result = item.label;
						return true;
					}
				});
			}

			return result;
		});
	}
};

exports.processingStepServiceColumn = {
	head: _("Registration"),
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return span(businessProcess._label);
	}
};
