'use strict';

var formatLastModified = require('./utils/last-modified'),
_ = require('mano').i18n.bind('User');

module.exports = [{
	head: _("Entity"),
	data: function (businessProcess) { return businessProcess._businessName; }
}, {
	head: _("Service"),
	data: function (businessProcess) { return businessProcess._label; }
}, {
	head: _("Submission date"),
	data: function (businessProcess) { return businessProcess.submissionForms.
		_isAffidavitSigned._lastModified.map(formatLastModified); }
}, {
	head: _("Withdraw date"),
	data: function (businessProcess) { return businessProcess.
		_isApproved._lastModified.map(formatLastModified); }
}, {
	head: _("Inscriptions and controls"),
	data: function (businessProcess) { return list(businessProcess.registrations.requested,
		function (reg) {
			return span({ class: 'label-reg' }, reg.abbr);
		}); }
}];
