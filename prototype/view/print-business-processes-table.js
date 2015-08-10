// Official print page

'use strict';

var _ = require('mano').i18n.bind('Official: Revision')
, users = require('mano').db.BusinessProcessNew.instances
, formatLastModified = require('../../view/utils/last-modified');

module.exports = exports = require('../../view/print-business-processes-table');

exports._defaultSort = function (a, b) {
	return a._submitted.lastModified - b._submitted.lastModified;
};

exports._statusMap = function () {

	return {
		todos: {
			data: users,
			label: _("All"),
			order: 1
		},
		'': {
			data: users,
			label: _("Pending review"),
			order: 2
		},
		'mandado-para-correciones': {
			data: users,
			label: _("Sent for corrections"),
			order: 3
		},
		rechazado: {
			data: users.filterByKey('isRevisionApproved', false),
			label: _("Rejected"),
			order: 4
		},
		aprobado: {
			data: users.filterByKey('isRevisionApproved', true),
			label: _("Approved"),
			order: 5
		}
	};
};

exports._businessProcessesTable = function (businessProcesses) {
	return [thead(
		tr(
			th(_("Entity")),
			th(_("Service")),
			th(_("Submission date")),
			th(_("Withdraw date")),
			th(_("Inscriptions and controls"))
		)
	),
		tbody(_if(gt(businessProcesses._length, 0),
			list(businessProcesses, function (user) {
				tr(
					td(user._businessName, " - ", span(user.representative._email)),
					td(user._label),
					td(user.submissionForms.
						_isAffidavitSigned._lastModified.map(formatLastModified)),
					td(user._isApproved._lastModified.map(formatLastModified)),
					td(
						list(user.registrations.requested, function (reg) {
							return span({ class: 'label-reg' }, reg.abbr);
						})
					)
				);
			}), tr({ class: 'empty' }, td({ colspan: 5 }, _("There are no users at the moment.")))))];
};
