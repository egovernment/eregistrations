// User: Account documents and data view

'use strict';

var _            = require('mano').i18n.bind('View: Documents list')
  , from         = require('es5-ext/array/from')
  , tableColumns = require('./_business-process-table-columns')
  , columns      = from(tableColumns.columns);

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
				table(
					{ class: 'submitted-user-data-table' },
					thead(tr(th(_("Status")), list(columns, function (column) {
						return th({ class: column.class }, column.head);
					}))),
					tbody(
						businessProcesses,
						function (businessProcess) {
							return tr(td(businessProcess._status), list(columns, function (column) {
								return td({ class: column.class }, column.data(businessProcess));
							}));
						}
					)
				))];
	}.bind(this),
		md(_('You have not started any services yet.' +
			' Please choose a service in the list below' +
			' and click on "Click to start" to launch the service. After the first save,' +
			' you will see your file here and will be able to edit it.'))));
};
