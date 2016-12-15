// User: Account documents and data view

'use strict';

var _            = require('mano').i18n.bind('View: User')
  , from         = require('es5-ext/array/from')
  , wrapColumns  = require('./components/utils/table-column-wrapper')
  , tableColumns = require('./components/table-columns')
  , columns      = from(require('./components/business-processes-table-columns'));

columns = [tableColumns.businessProcessStatusColumn].concat(columns);
columns.push(tableColumns.businessProcessActionsColumn);

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
						rowAttributes: function (businessProcess) {
							return { class: _if(or(businessProcess._isSentBack,
								businessProcess._isUserProcessing), 'submitted-user-data-table-sent-back') };
						},
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
