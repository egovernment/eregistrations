// User: Account documents and data view

'use strict';

var _            = require('mano').i18n.bind('View: User')
  , tableColumns = require('./components/business-process-table-columns')
  , wrapColumns  = require('./components/utils/table-column-wrapper')
  , columns;

exports._statusColumn = {
	head: _("Status"),
	data: function (businessProcess) {
		return businessProcess._status;
	}
};

columns = [exports._statusColumn].concat(tableColumns.columns);
columns.push(tableColumns.actionsColumn);

exports._parent = require('./user');

exports['user-account-requests'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessProcesses = this.user.businessProcesses.filterByKey('isFromEregistrations', true);

	insert(_if(businessProcesses._size, function () {
		return [p({ class: 'section-primary-legend' },
			_("Here you can modify not yet submitted requests, follow the process of the " +
				"ongoing procedures and view already concluded records.")),
			section({ class: 'submitted-main table-responsive-container' },
				table({
					class: 'submitted-user-data-table',
					configuration: {
						collection: businessProcesses,
						columns: wrapColumns(columns, function (content, businessProcess) {
							return postButton({
								action: url('business-process', businessProcess.__id__),
								value: content
							});
						})
					}
				}))];
	}.bind(this),
		_if(this.manager, md(_('No service has been started for this client yet. Please choose a ' +
			'service in the list below and click on "Click to start" to launch the service. ' +
			'After the first save, you will see the file here and will be able to edit it.')),
			md(_('You have not started any services yet.' +
				' Please choose a service in the list below' +
				' and click on "Click to start" to launch the service. After the first save,' +
				' you will see your file here and will be able to edit it.')))));
};
