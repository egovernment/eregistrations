'use strict';

var formatLastModified = require('./utils/last-modified')
  , _ = require('mano').i18n.bind('User')
  , ProcessingStepStatus = require('mano').db.ProcessingStepStatus;

exports.getServiceIcon = function (businessProcess) {
	return i({ class: "fa fa-user" });
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
	data: function (businessProcess) { return businessProcess.submissionForms.
		_isAffidavitSigned._lastModified.map(formatLastModified); }
}, {
	head: _("Withdraw date"),
	class: 'submitted-user-data-table-date',
	data: function (businessProcess) { return businessProcess.
		_isApproved._lastModified.map(formatLastModified); }
}, {
	head: _("Inscriptions and controls"),
	data: function (businessProcess) {
		return list(businessProcess.certificates.applicable, function (cert) {
			var processingStep = cert.processingStep;

			return span({ class: 'hint-optional hint-optional-left',
				'data-hint': [cert.constructor.label, _if(businessProcess._isRejected,
					"- " + ProcessingStepStatus.meta.rejected.label,
					processingStep && processingStep._resolvedStatus.map(function (status) {
						return "- " + ProcessingStepStatus.meta[status].label;
					}))] },
				span({ class: ['label-reg',
					_if(businessProcess._isRejected, "rejected",
						_if(processingStep && processingStep._isApproved, "approved",
							_if(processingStep && processingStep._isReady, "ready")))] }, cert.constructor.abbr));
		});
	}
}];
