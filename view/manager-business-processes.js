// User Manager: Requests view

'use strict';

var _                  = require('mano').i18n.bind('View: Manager')
  , actionsColumn      = require('./components/business-process-table-columns').actionsColumn
  , getServiceIcon     = require('./components/business-process-table-columns').getServiceIcon
  , formatLastModified = require('./utils/last-modified');

exports._parent = require('./manager');

exports['manager-account-requests'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var requests = this.user.managedBusinessProcesses, user = this.user;

	insert(_if(not(this.user._isManagerActive),
		p({ class: 'section-primary-legend' }, _("Your account is currently inactive")),
		p({ class: 'section-primary-legend' }, _("Here is the list of " +
			"requests that you have started " +
			"in the name of your client. " +
			"Click on the pen to modify the request or on the " +
			"magnifying glass to see the status of the registration."))));

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
							td({ class: 'submitted-user-data-table-service' },
								span({ class: 'hint-optional hint-optional-right',
										'data-hint': businessProcess._label },
									getServiceIcon(businessProcess))),
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
