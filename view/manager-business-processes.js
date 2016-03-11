// User Manager: Requests view

'use strict';

var _            = require('mano').i18n.bind('View: Requests')
  , actionsColumn = require('./_business-process-table-columns').actionsColumn
  , formatLastModified = require('./utils/last-modified');

exports._parent = require('./manager');

exports['manager-account-requests'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var requests = this.user.managedBusinessProcesses, user = this.user;

	section(_if(not(this.user._isManagerActive),
		p({ class: 'entities-overview-info' }, _("Your account is currently inactive"))));

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
					requests,
					function (businessProcess) {
						return tr(
							td(businessProcess._abbr),
							td(businessProcess.user._fullName),
							td(businessProcess._businessName),
							td(_if(businessProcess._isSubmitted, function () {
								return businessProcess._isSubmitted._lastModified.map(formatLastModified);
							})),
							td(businessProcess._status),
							td({ class: 'actions' }, _if(user._isManagerActive,
								actionsColumn.data(businessProcess), _("N/A")))
						);
					}
				)
			));
	}.bind(this),
		_if(this.user._isManagerActive, p(_('You have no requests yet.')))));
};
