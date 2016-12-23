// User Manager: Clients view

'use strict';

var _ = require('mano').i18n.bind('View: Manager');

exports._parent = require('./manager');

exports['manager-account-clients'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var manager = this.user
	  , clients = manager.managedUsers;

	insert(_if(manager._isManagerActive,
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
					th({ colspan: "2" })
				)),
				tbody(
					clients,
					function (client) {
						var bpSet = client.initialBusinessProcesses.and(manager.managedBusinessProcesses)
									.filterByKey('businessName');

						return tr(
							td(client._fullName),

							td(bpSet.map(function (bp) { console.log(bp.__id__); return bp.constructor; })._size),
							_if(manager._isManagerActive,
								[td(
									postButton({
										action: url('clients', client.__id__),
										value: _("Access the client's account")
									})
								),
									td(
										_if(client._canManagedUserBeDestroyed,
											postButton({
												action: url('clients', client.__id__, 'delete'),
												confirm: _("Are you sure?"),
												value: _("Remove the client's account")
											}),
											_("N/A")
											)
									)], td({ colspan: "2" }, _("N/A"))
								)
						);
					},
					this
				)
			));
	}.bind(this),
		_if(manager._isManagerActive, p(_('You have no clients yet.')))));
};
