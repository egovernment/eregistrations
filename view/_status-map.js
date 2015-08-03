'use strict';

var memoize = require('memoizee/plain')
  , _       = require('mano').i18n.bind('Official: Revision')

  , all = require('eregistrations/business-processes').filterByKey('isRevisionReady', true)
	.filterByKey('isApplicationResolved', false);

module.exports = memoize(function (institution) {
	var users = all.filterByKey('revisionInstitution', institution);
	return {
		todos: {
			data: users,
			label: _("All"),
			order: 1
		},
		'': {
			data: users.filterByKey('isRevisionPending', true),
			label: _("Pending review"),
			order: 2
		},
		'mandado-para-correciones': {
			data: users.filterByKey('isRevisionSentBack', true),
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
});
