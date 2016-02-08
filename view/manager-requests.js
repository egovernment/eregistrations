// User Manager: Requests view

'use strict';

var _            = require('mano').i18n.bind('View: Requests')
  , actionsColumn = require('./_business-process-table-columns').actionsColumn
  , formatLastModified = require('./utils/last-modified');

exports._parent = require('./manager');

exports['manager-account-requests'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var requests = this.user.managedBusinessProcesses;

	insert(_if(requests._size, function () {
		return section({ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table' },
				thead(tr(
					th(_("Service")),
					th(_("Client")),
					th(_('Entity')),
					th(_('Submission date')),
					th(_('State')),
					th()
				)),
				tbody(
					requests.toArray(function (req1, req2) {
						return req1.lastModified - req2.lastModified;
					}),
					function (request) {
						return tr(
							td(request._label),
							td(request.user._fullName),
							td(request._businessName),
							td(_if(request._isSubmitted, function () {
								return request._isSubmitted._lastModified.map(formatLastModified);
							})),
							td(request._status),
							td({ class: 'actions' }, actionsColumn.data(request))
						);
					}
				)
			));
	}.bind(this),
		md(_('You have no requests yet.'))));
};
