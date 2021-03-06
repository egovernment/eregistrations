'use strict';

var db                    = require('../../db')
  , _                     = require('mano').i18n.bind('View: Component: Inspector')
  , someRight             = require('es5-ext/array/#/some-right')
  , objectSome            = require('es5-ext/object/some')
  , timeRanges            = require('../../utils/supervisor-time-ranges')
  , formatLastModified    = require('../utils/last-modified')
  , formatLastModifiedDate    = require('../utils/last-modified-date')
  , certificateStatusMeta = db.CertificateStatus.meta;

var findRejectionStep = function (businessProcess) {
	var stepFound;

	objectSome(businessProcess.processingSteps.map, function self(step) {
		if (db.ProcessingStepGroup && (step instanceof db.ProcessingStepGroup)) {
			return objectSome(step.steps.map, self);
		}

		if (step.status === 'rejected') {
			stepFound = step;
			return true;
		}
	});

	return stepFound;
};

exports.getCertificateStatusLabel = function (cert) {
	if (cert._status) return _if(cert._status, ["- ", cert._status]);
	return cert.status && ("- " + certificateStatusMeta[cert.status].label);
};

exports.resolveCertificateStatusClass = function (status) {
	if (!status) return;
	if (status === 'pending') return 'ready';
	return status;
};

exports.getCertificateStatusClass = function (cert) {
	if (cert._status) return cert._status.map(exports.resolveCertificateStatusClass);
	return exports.resolveCertificateStatusClass(cert.status);
};

exports.generateCertificatesList = function (certificates) {
	return span(list(certificates, function (cert) {
		return span({ class: 'hint-optional hint-optional-left',
			'data-hint': [cert.label, exports.getCertificateStatusLabel(cert)] },
			span({ class: ['label-reg', exports.getCertificateStatusClass(cert)] }, cert.abbr));
	}));
};

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
	class: 'submitted-user-data-table-business-process-status',
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
	class: 'submitted-user-data-table-name',
	data: function (businessProcess) {
		return businessProcess._businessName;
	}
};

exports.businessProcessCertificatesListColumn = {
	head: _("Inscriptions and controls"),
	class: 'submitted-user-data-table-certs',
	data: function (businessProcess) {
		return mmap(businessProcess._isClosed, function (isClosed) {
			if (!businessProcess.certificates) return;
			if (isClosed) {
				return mmap(businessProcess.certificates.dataSnapshot._resolved, function (certificates) {
					if (!certificates) return;
					return exports.generateCertificatesList(certificates);
				});
			}
			return mmap(businessProcess.certificates._applicable, function (certificates) {
				if (!certificates) return;
				return exports.generateCertificatesList(certificates);
			});
		});
	}
};

exports.businessProcessCreationDateColumn = {
	head: _("Creation date"),
	class: 'submitted-user-data-table-date-time',
	data: function (businessProcess) {
		return formatLastModified(businessProcess.lastModified);
	}
};

exports.businessProcessSubmissionDateColumn = {
	head: _("Submission date"),
	class: 'submitted-user-data-table-date-time',
	data: function (businessProcess) {
		var isSubmitted = businessProcess._isSubmitted;

		return _if(isSubmitted, function () {
			return isSubmitted._lastModified.map(formatLastModified);
		});
	}
};

exports.businessProcessWithdrawalDateColumn = {
	head: _("Withdraw date"),
	class: 'submitted-user-data-table-date-time',
	data: function (businessProcess) {
		var isApproved = businessProcess._isApproved;

		return _if(isApproved, function () {
			return isApproved._lastModified.map(formatLastModified);
		});
	}
};

exports.businessProcessRejectionReason = {
	head: _("Rejection reason"),
	class: 'submitted-user-data-table-date-time',
	data: function (businessProcess) {
		var stepFound = findRejectionStep(businessProcess);

		if (stepFound) {
			return stepFound._rejectionReason;
		}
	}
};

exports.businessProcessRejectionProcessor = {
	head: _("Operator"),
	class: 'submitted-user-data-table-date-time',
	data: function (businessProcess) {
		var stepFound = findRejectionStep(businessProcess);

		if (stepFound) {
			return stepFound._processor;
		}
	}
};

exports.businessProcessRejectionStep = {
	head: _("Role"),
	class: 'submitted-user-data-table-date-time',
	data: function (businessProcess) {
		var stepFound = findRejectionStep(businessProcess);

		if (stepFound) {
			return stepFound._label;
		}
	}
};

exports.businessProcessRejectionDateColumn = {
	head: _("Rejection date"),
	class: 'submitted-user-data-table-date-time',
	data: function (businessProcess) {
		var isRejected = businessProcess._isRejected;

		return _if(isRejected, function () {
			return isRejected._lastModified.map(formatLastModifiedDate);
		});
	}
};

exports.businessProcessActionsColumn = {
	class: 'submitted-user-data-table-actions',
	data: function (businessProcess) {
		if (businessProcess._link) {
			return a({ href: businessProcess._link, target: "_blank" }, i({ class: 'fa fa-search' }));
		}
		return _if(businessProcess._isAtDraft,
			[postButton({
				buttonClass: 'actions-edit',
				action: url('business-process', businessProcess.__id__),
				value: span({
					class: 'hint-optional hint-optional-left',
					'data-hint': _('Edit')
				}, i({ class: 'fa fa-edit' }))
			}),
				_if(not(businessProcess._isSubmitted), postButton({
					buttonClass: 'actions-delete',
					action: url('business-process', businessProcess.__id__, 'delete'),
					confirm: _("Are you sure?"),
					value: span({
						class: 'hint-optional hint-optional-left',
						'data-hint': _('Delete')
					}, i({ class: 'fa fa-trash-o' }))
				}))],

			postButton({
				buttonClass: 'actions-edit',
				action: url('business-process', businessProcess.__id__),
				value: span({ class: 'fa fa-search' }, _("Go to"))
			}));
	}
};

exports.businessProcessGoToColumn = {
	class: 'submitted-user-data-table-link',
	data: function (businessProcess) {
		return a({ class: 'actions-edit',
			href: url(businessProcess.__id__) },
			span({ class: 'fa fa-search' }, _("Go to")));
	}
};

exports.businessProcessArchiverColumn = {
	class: 'submitted-user-data-table-link',
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
	class: 'submitted-user-data-table-name',
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return businessProcess._businessName;
	}
};

exports.processingStepRoleColumn = {
	head: _("Role"),
	class: 'submitted-user-data-table-role',
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
	class: 'submitted-user-data-table-date',
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
	class: 'submitted-user-data-table-service',
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return span(businessProcess._label);
	}
};

exports.processingStepGoToColumn = {
	class: 'submitted-user-data-table-link',
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return a({ class: 'actions-edit',
				href: url(businessProcess.__id__) },
			span({ class: 'fa fa-search' }, _("Go to")));
	}
};
