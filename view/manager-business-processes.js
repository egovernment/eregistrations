// User Manager: Requests view

'use strict';

var _            = require('mano').i18n.bind('View: Manager')
  , assign       = require('es5-ext/object/assign')
  , tableColumns = require('./components/table-columns')
  , wrapColumns  = require('./components/utils/table-column-wrapper');

exports._parent = require('./manager');

exports['manager-account-requests'] = { class: { active: true } };

exports._clientColumn = {
	head: _("Client"),
	data: function (businessProcess) {
		return businessProcess.user._fullName;
	}
};

exports._actionsColumn = assign({}, tableColumns.businessProcessActionsColumn);

exports._columns = [
	tableColumns.servicesColumn,
	exports._clientColumn,
	tableColumns.businessProcessBusinessNameColumn,
	tableColumns.businessProcessSubmissionDateColumn,
	exports.businessProcessStatusColumn,
	exports._actionsColumn
];

exports['manager-account-content'] = function () {
	var user     = this.user
	  , requests = user.managedBusinessProcesses;

	exports._actionsColumn.data = function (businessProcess) {
		return _if(user._isManagerActive,
			tableColumns.businessProcessActionsColumn.data(businessProcess), _("N/A"));
	};

	insert(_if(not(user._isManagerActive),
		p({ class: 'section-primary-legend' }, _("Your account is currently inactive")),
		p({ class: 'section-primary-legend' }, _("Here is the list of " +
			"requests that you have started " +
			"in the name of your client. " +
			"Click on the pen to modify the request or on the " +
			"magnifying glass to see the status of the registration."))));

	insert(_if(requests._size, function () {
		return section({ class: 'submitted-main table-responsive-container' },
			table({
				class: 'submitted-user-data-table',
				configuration: {
					collection: requests,
					columns: wrapColumns(exports._columns, function (content, businessProcess) {
						return postButton({
							action: url('business-process', businessProcess.__id__),
							value: content
						});
					})
				}
			}));
	}.bind(this),
		_if(user._isManagerActive, p(_('You have no requests yet.')))));
};
