// User Manager: Clients view

'use strict';

var _            = require('mano').i18n.bind('View: Client');

exports._parent = require('./manager');

exports['manager-account-clients'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var clients = this.user.managedUsers;

	section(a({ href: url('new-client'), class: 'button-main' },
				_("Add client"))
		);

	insert(_if(clients._size, function () {
		return section({ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table' },
				thead(tr(
					th(_("Client")),
					th(_('Linked entities')),
					th(_('Services')),
					th(_('Email')),
					th()
				)),
				tbody(
					clients,
					function (client) {
						var bpSet = client.initialBusinessProcesses.and(this.user.managedBusinessProcesses)
									.filterByKey('businessName');
						return tr(
							td(client._fullName),

							td(ul(bpSet,
								function (bp) {
									return [bp._businessName, " (", bp.label, ")"];
								})),

							td(bpSet.map(function (bp) { return bp.constructor; })._size),

							td(span(client._email),
								_if(client.roles._has('user'), [" ", span({ class: 'fa fa-check' })])),

							td({ class: 'actions' },
								_if(eq(client._manager, this.user),
									[
										postButton({ buttonClass: 'actions-edit',
											action: url('clients', client.__id__),
											value: span({ class: 'fa fa-edit' }) }),
										_if(eq(client.initialBusinessProcesses
											.filterByKey('isSubmitted', true)._size, 0),
											postButton({ buttonClass: 'actions-delete',
												action: url('clients', client.__id__, 'delete'),
												confirm: _("Are you sure?"), value: span({ class: 'fa fa-trash-o' }) })
											)
									]
									)
								)
						);
					},
					this
				)
			));
	}.bind(this),
		p(_('You have no clients yet.'))));
};
