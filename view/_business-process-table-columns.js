'use strict';

var formatLastModified = require('./utils/last-modified'),
_ = require('mano').i18n.bind('User');

exports._getServiceIcon = function (businessProcess) {
	return i({ class: "fa fa-user" });
};

module.exports.columns = [{
	head: _("Service"),
	class: 'submitted-user-data-table-service',
	data: function (businessProcess) {
		return span({ class: 'hint-optional hint-optional-right', 'data-hint': businessProcess._label },
			exports._getServiceIcon(businessProcess));
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
	data: function (businessProcess) { return list(businessProcess.registrations.requested,
		function (reg) {
			return span({ class: 'label-reg' }, reg.abbr);
		}); }
}];
