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
}, {
	class: 'actions',
	data: function (businessProcess) {
		return _if(eq(businessProcess._status, 'draft'),
				function () { return [a({ href: url(businessProcess.__id__), rel: "server" },
					span({ class: 'fa fa-edit' },
						_("Go to"))),
					postButton({ buttonClass: 'actions-delete',
						action: url('business-process', businessProcess.__id__, 'delete'),
						confirm: _("Are you sure?"),
						value: span({ class: 'fa fa-trash-o' })
						})]; },
				function () { return a({ class: 'actions-edit',
					href: url(businessProcess.__id__), rel: "server" },
					span({ class: 'fa fa-search' },
						_("Go to"))); }
				);
	}
}];
