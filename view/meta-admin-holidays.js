'use strict';

var db      = require('mano').db
  , _       = require('mano').i18n.bind('View: Meta Admin')
  , dayName = {
	0: _("Sunday"),
	1: _("Monday"),
	2: _("Tuesday"),
	3: _("Wednesday"),
	4: _("Thursday"),
	5: _("Friday"),
	6: _("Saturday")
};

exports._parent = require('./meta-admin-base');

exports['holidays-nav'] = { class: { 'pills-nav-active': true } };

exports['meta-admin-main'] = {
	content: function () {
		h2(_("Holidays edition"));

		section({ class: 'holidays-add-holiday section-primary users-table-filter-bar' },
			form({ id: 'form-holidays', action: url('add-holiday-date'), method: 'post' },
				div(
					label(_("Add date")),
					input({
						dbjs: db.Date,
						min: db.globalPrimitives.getDescriptor('holidays').min,
						max: db.globalPrimitives.getDescriptor('holidays').max,
						name: 'date'
					})
				),
				div(input({ type: "submit", value: _("Add") })),
				div({ class: 'dbjs-input-component' },
					span({ class: 'error-message error-message-date' }))));

		div({ class: 'table-responsive-container' },
			table({ class: 'submitted-user-data-table submitted-current-user-data-table' +
					' holidays-list-table' },
				tbody(db.globalPrimitives.holidays.toArray(function (a, b) {
					return a - b;
				}), function (date) {
					tr(
						td(dayName[date.getUTCDay()]),
						td(date),
						td(postButton({
							action: url('delete-holiday-date'),
							value: span({ class: 'fa fa-trash-o' }, _("Delete"))
						}, input({
							type: 'hidden',
							name: 'date',
							value: db.Date.toInputValue(date)
						})))
					);
				})));
	}
};
