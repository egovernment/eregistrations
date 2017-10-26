// User: Account documents and data view

'use strict';

var _ = require('mano').i18n.bind('View: User')
  , from = require('es5-ext/array/from')
  , tableColumns = require('./components/table-columns')
  , columns = from(require('./components/business-processes-table-columns'))
  , getData = require('mano/lib/client/xhr-driver').get
  , ObservableSet = require('observable-set')
  , jsonToObservables = require('../utils/json-to-observables');

columns.push(tableColumns.businessProcessActionsColumn);

exports._parent = require('./user');

exports['user-account-requests'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessProcesses = new ObservableSet([])
	  , sourceCollection = this.user.businessProcesses.filterByKey('isFromEregistrations', true);
	sourceCollection.forEach(function (bp) {
		businessProcesses.add(bp);
	});
	sourceCollection.on('change', function (event) {
		if (event.type === 'add') {
			businessProcesses.add(event.value);
		}
		if (event.type === 'delete') {
			businessProcesses.some(function (bp) {
				if (bp.__id__ === event.value.__id__) {
					businessProcesses.delete(bp);
					return true;
				}
			});
		}
	});
	getData('/get-external-requests/').done(function (items) {
		if (!items) return;
		items.forEach(function (req) {
			businessProcesses.add(jsonToObservables(req));
		});
	});

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
							return tr({ class: _if(or(businessProcess._isSentBack,
									businessProcess._isUserProcessing), "submitted-user-data-table-sent-back") },
								td({ class: "submitted-user-data-table-business-process-status" },
									businessProcess._status), list(columns, function (column) {
									return td({ class: column.class }, column.data(businessProcess));
								}));
						}
					)
				))];
	}.bind(this),
		_if(this.manager, md(_('No service has been started for this client yet. Please choose a ' +
			'service in the list below and click on "Click to start" to launch the service. ' +
			'After the first save, you will see the file here and will be able to edit it.')),
			md(_('You have not started any services yet.' +
				' Please choose a service in the list below' +
				' and click on "Click to start" to launch the service. After the first save,' +
				' you will see your file here and will be able to edit it.')))));
};
