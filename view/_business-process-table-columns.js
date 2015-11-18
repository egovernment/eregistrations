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
			if (!processingStep) return;

			return span({ class: 'hint-optional hint-optional-left',
					'data-hint': _if(businessProcess._isRejected,
							cert.constructor.label + ' - ' + ProcessingStepStatus.meta.rejected.label,
						processingStep._resolvedStatus.map(function (status) {
						var result = cert.constructor.label;
						if (status) {
							result += ' - ' + ProcessingStepStatus.meta[status].label;
						}
						return result;
					})) },
				span({ class: ['label-reg',
					_if(businessProcess._isRejected, "rejected",
						_if(processingStep._isApproved, "approved",
							_if(processingStep._isReady, "ready")))] }, cert.constructor.abbr));
		});
	}
}];
