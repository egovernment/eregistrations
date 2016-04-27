'use strict';

var _                    = require('mano').i18n.bind('View: Component: Business Process table')
  , ProcessingStepStatus = require('mano').db.ProcessingStepStatus
  , formatLastModified   = require('../utils/last-modified');

exports.getServiceIcon = function (businessProcess) {
	return i({ class: "fa fa-user" });
};

exports.actionsColumn = {
	class: 'actions',
	data: function (businessProcess) {
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

exports.archiverColumn = {
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

exports.goToColumn = {
	class: 'submitted-user-data-table-link',
	data: function (businessProcess) {
		return a({ class: 'actions-edit',
			href: url(businessProcess.__id__) },
			span({ class: 'fa fa-search' }, _("Go to")));
	}
};

exports.getCertStatus = function (cert) {
	var processingStep = cert.processingStep, businessProcess = cert.master;

	return _if(businessProcess._isRejected,
		"rejected", processingStep && processingStep._status);
};

exports.columns = [{
	head: _("Service"),
	class: 'submitted-user-data-table-service',
	data: function (businessProcess) {
		return span({ class: 'hint-optional hint-optional-right', 'data-hint': businessProcess._label },
			exports.getServiceIcon(businessProcess));
	}
}, {
	head: _("Entity"),
	data: function (businessProcess) { return businessProcess._businessName; }
}, {
	head: _("Submission date"),
	class: 'submitted-user-data-table-date',
	data: function (businessProcess) {
		var isSubmitted = businessProcess._isSubmitted;

		return _if(isSubmitted, function () {
			return isSubmitted._lastModified.map(formatLastModified);
		});
	}
}, {
	head: _("Withdraw date"),
	class: 'submitted-user-data-table-date',
	data: function (businessProcess) {
		var isApproved = businessProcess._isApproved;

		return _if(isApproved, function () {
			return isApproved._lastModified.map(formatLastModified);
		});
	}
}, {
	head: _("Inscriptions and controls"),
	data: function (businessProcess) {
		return mmap(businessProcess.certificates._applicable, function (certificates) {
			//When bp is deleted...
			if (!certificates) return;
			return span(list(businessProcess.certificates.applicable, function (cert) {
				var certStatus;

				certStatus = exports.getCertStatus(cert);
				return span({ class: 'hint-optional hint-optional-left',
					'data-hint': [cert.constructor.label,
						_if(eq(certStatus, "rejected"), "- " + ProcessingStepStatus.meta.rejected.label,
							certStatus.map(function (status) {
								if (status) return "- " + ProcessingStepStatus.meta[status].label;
							}))] },
					span({ class: ['label-reg',
						_if(eq(certStatus, "rejected"), "rejected",
							_if(eq(certStatus, 'approved'), "approved",
								_if(not(eqSloppy(certStatus, null)), "ready")))]  }, cert.constructor.abbr));
			}));
		});
	}
}];
