// Official print page

'use strict';

var _ = require('mano').i18n.bind('Official: Revision')
, location = require('mano/lib/client/location')
, formatLastModified = require('../../view/utils/last-modified')
, keys = Object.keys
, officialStatusMap
, statusMap
, defaultSort
, users = require('mano').db.BusinessProcessNew.instances;

module.exports = exports = require('../../view/official-print');

statusMap = function () {

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

defaultSort = function (a, b) {
	return a._submitted.lastModified - b._submitted.lastModified;
};

exports._businessProcessesTable = function () {

	var getSection  = function (state, url) {
		var data = officialStatusMap[state],
			businessProcesses = data.data.toArray(defaultSort);

		return table({ class: 'print-users-list' },
			thead(
				tr(
					th({ colspan: 5 }, data.label, span(" (", businessProcesses._length, ")"))
				),
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
				}), tr({ class: 'empty' }, td({ colspan: 3 }, _("There are no users at the moment."))))));
	};

	officialStatusMap = statusMap(this);

	return section({ id: 'main' },
		mmap(location.query.get('estado'), function (value) {

			if (value == null) return getSection('', url);
			if (officialStatusMap[value] == null) return;
			if (value !== 'todos') return getSection(value, url);

			return list(keys(officialStatusMap).filter(function (name) {
				return name !== 'todos';
			}).data.sort(defaultSort), function (state) { return getSection(state, url); });
		}));
};
