// User: Account documents and data view

'use strict';

var columns = require('./_business-process-table-columns');

exports._parent = require('./user');

exports['user-account-requests'] = { class: { active: true } };
exports['user-account-content'] = function () {
	insert(_if(this.user.businessProcesses._size, function () {
		section({ class: 'section-primary' },
			section(
				{ class: 'submitted-main table-responsive-container' },
				table(
					{ class: 'submitted-user-data-table submitted-current-user-data-table' },
					thead(tr(list(columns,
						function (column) { return th({ class: column.class }, column.head); }))),
					tbody(
						this.user.businessProcesses,
						function (businessProcess) {
							return tr(list(columns,
								function (column) {
									return td({ class: column.class }, column.data(businessProcess));
								}));
						}
					)
				)
			));
	}.bind(this)));
};
