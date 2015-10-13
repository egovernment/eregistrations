// User: Account documents and data view

'use strict';

var columns = require('./_business-process-table-columns'),
	_ = require('mano').i18n.bind('View: Documents list');

// Actions column with 'goto', 'edit' and 'delete' actions.
columns.push({
	class: 'actions',
	data: function (businessProcess) {
		return _if(eq(businessProcess._status, 'draft'),
				function () { return [a({ href: url(businessProcess.__id__), rel: "server" },
					span({ class: 'fa fa-edit' },
						_("Go to"))),
					postButton({ buttonClass: 'actions-delete',
						action: url('business-process', businessProcess.__id__, 'delete'),
						confirm: _("Are you sure?"),
						value: span({ class: 'fa fa-trash-o' })
						})]; },
				function () { return a({ class: 'actions-edit',
					href: url(businessProcess.__id__), rel: "server" },
					span({ class: 'fa fa-search' },
						_("Go to"))); }
				);
	}
});

exports._parent = require('./user');

exports['user-account-requests'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessProcesses = this.user.businessProcesses.filterByKey('isFromEregistrations', true);

	section({ class: 'section-primary' },
		_if(businessProcesses._size, function () {
			return section(
				{ class: 'submitted-main table-responsive-container' },
				table(
					{ class: 'submitted-user-data-table submitted-current-user-data-table' },
					thead(tr(list(columns,
						function (column) { return th({ class: column.class }, column.head); }))),
					tbody(
						businessProcesses,
						function (businessProcess) {
							return tr(list(columns,
								function (column) {
									return td({ class: column.class }, column.data(businessProcess));
								}));
						}
					)
				)
			);
		}.bind(this),
			md(_('You have not started any services yet.' +
				' Please choose a service in the list below' +
				' and click on "Click to start" to launch the service. After the first save,' +
				' you will see your file here and will be able to edit it.'))
			));
};
