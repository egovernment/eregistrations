'use strict';

var location = require('mano/lib/client/location')
  , formatLastModified = require('./utils/last-modified')
  , _ = require('mano').i18n.bind('Official')
  , keys = Object.keys
  , officialStatusMap;

exports._parent = require('./print-base');

exports.main = {
	content: function () {

		exports._businessProcessesTable(this);

		// var getSection  = function (state, url) {
		// 	var data = officialStatusMap[state],
		// 		businessProcesses = data.data.toArray(exports._defaultSort);

		// 	return table({ class: 'print-users-list' },
		// 		thead(
		// 			tr(
		// 				th({ colspan: 5 }, data.label, span(" (", businessProcesses._length, ")"))
		// 			),
		// 			tr(
		// 				th(_("Entity")),
		// 				th(_("Service")),
		// 				th(_("Submission date")),
		// 				th(_("Withdraw date")),
		// 				th(_("Inscriptions and controls"))
		// 			)
		// 		),
		// 		tbody(_if(gt(businessProcesses._length, 0),
		// 			list(businessProcesses, function (user) {
		// 				tr(
		// 					td(user._businessName, " - ", span(user.representative._email)),
		// 					td(user._label),
		// 					td(user.submissionForms.
		// 						_isAffidavitSigned._lastModified.map(formatLastModified)),
		// 					td(user._isApproved._lastModified.map(formatLastModified)),
		// 					td(
		// 						list(user.registrations.requested, function (reg) {
		// 							return span({ class: 'label-reg' }, reg.abbr);
		// 						})
		// 					)
		// 				);
		// 			}), tr({ class: 'empty' }, td({ colspan: 3 }, _("There are no users at the moment."))))));
		// };

		// officialStatusMap = exports._statusMap(this);

		// section({ id: 'main' },
		// 	mmap(location.query.get('estado'), function (value) {

		// 		if (value == null) return getSection('', url);
		// 		if (officialStatusMap[value] == null) return;
		// 		if (value !== 'todos') return getSection(value, url);

		// 		return list(keys(officialStatusMap).filter(function (name) {
		// 			return name !== 'todos';
		// 		}).data.sort(exports._defaultSort), function (state) { return getSection(state, url); });
		// 	}));

	}
};

exports._businessProcessesTable = Function.prototype;
