// Forms step page

'use strict';

var _ = require('mano').i18n.bind('Official: Revision')
, users = require('mano').db.BusinessProcessNew.instances;

module.exports = exports = require('../../view/official-print');

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

exports._defaultSort = function (a, b) {
	return a._submitted.lastModified - b._submitted.lastModified;
};

exports._parent._officialRoleName = function () {
	return 'Role';
};
