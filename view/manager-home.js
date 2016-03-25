// User Manager: Clients view

'use strict';

var _            = require('mano').i18n.bind('View: Client');

exports._parent = require('./manager');

exports['manager-account-clients'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var clients = this.user.managedUsers;

	insert(_if(this.user._isManagerActive,
		[p({ class: 'section-primary-legend' }, _("Here is your list of clients. " +
			"By clicking on the pen, you will arrive in their Client " +
			"Account where you will be able to start a service on their " +
			"name and see all their documents and data")),
			a({ href: url('new-client'), class: 'button-main' },
				_("Add client"))], p({ class: 'section-primary-legend' },
			_("Your account is currently inactive"))));

	insert(_if(clients._size, function () {
		return section({ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table' },
				thead(tr(
					th(_("Client")),
					th(_('Services')),
					th()
				)),
				tbody(
					clients,
					function (client) {
						var bpSet = client.initialBusinessProcesses.and(this.user.managedBusinessProcesses)
									.filterByKey('businessName');

						return tr(
							td(client._fullName),

							td(bpSet.map(function (bp) { return bp.constructor; })._size),

							td({ class: 'actions' },
								_if(and(this.user._isManagerActive,
										eq(client._manager, this.user)),
									[
										postButton({ buttonClass: 'actions-edit',
											action: url('clients', client.__id__),
											value: span({ class: 'fa fa-edit' }) }),
										_if(client._canManagedUserBeDestroyed,
											postButton({ buttonClass: 'actions-delete',
												action: url('clients', client.__id__, 'delete'),
												confirm: _("Are you sure?"), value: span({ class: 'fa fa-trash-o' }) })
											)
									], _("N/A")
									)
								)
						);
					},
					this
				)
			));
	}.bind(this),
		_if(this.user._isManagerActive, p(_('You have no clients yet.')))));
};
