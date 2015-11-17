// User: Account documents and data view

'use strict';

var _       = require('mano').i18n.bind('View: Documents list')
  , columns = require('./_business-process-table-columns').columns;

// Creates actions column cell with 'goto', 'edit' and 'delete' actions.
var createActionsCell = function (businessProcess) {
	return _if(businessProcess._isAtDraft,
			td({ class: 'actions' }, postButton({ buttonClass: 'actions-edit',
					action: url('business-process', businessProcess.__id__),
					value: span({ class: 'fa fa-edit' }, _("Go to"))
				}),
			_if(not(businessProcess._isSubmitted), postButton({ buttonClass: 'actions-delete',
					action: url('business-process', businessProcess.__id__, 'delete'),
					confirm: _("Are you sure?"),
					value: span({ class: 'fa fa-trash-o' })
					}))
				),
			td({ class: 'submitted-user-data-table-link' }, a({ class: 'actions-edit',
				href: url(businessProcess.__id__), rel: "server" },
					span({ class: 'fa fa-search' }, _("Go to"))))
			);
};

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
					}), th())),
					tbody(
						businessProcesses,
						function (businessProcess) {
							return tr(td(businessProcess._status), list(columns, function (column) {
								return td({ class: column.class }, column.data(businessProcess));
							}),
								createActionsCell(businessProcess));
						}
					)
				))];
	}.bind(this),
		md(_('You have not started any services yet.' +
			' Please choose a service in the list below' +
			' and click on "Click to start" to launch the service. After the first save,' +
			' you will see your file here and will be able to edit it.'))));
};
