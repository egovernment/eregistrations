// User Manager: Clients view

'use strict';

var _            = require('mano').i18n.bind('View: Client');

exports._parent = require('./manager');

exports['manager-account-clients'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var clients = this.user.managedUsers;

	section({ class: 'section-primary' },
		a({ href: url('new-client'), class: 'users-table-filter-bar-add', target: '_blank' },
				_("Add client")
				)
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
						var bpSet = client.initialBusinessProcesses.and(this.user.managedBusinessProcesses);
						return tr(
							td(client._fullName),

							td(ul(bpSet,
								function (bp) {
									return insert(_if(bp._businessName, [bp._businessName, " (", bp.label, ")"]));
								})),

							td(mmap(bpSet._size, function (size) {
								return bpSet.filter(function (bp) {
									return bp.businessName;
								}).map(function (bp) {
									return bp.abbr;
								}).toArray().join(', ');
							})),

							td(span(client._email),
								_if(client.roles._has('user'), span('✅'))),

							td({ class: 'actions' },
								_if(eq(client._manager, this.user),
									[a({ href:  url('clients', client.__id__) },
										span({ class: 'fa fa-edit' })),
										_if(eq(client.initialBusinessProcesses
												.filterByKey('isSubmitted', true)._size, 0),
												postButton({ buttonClass: 'actions-delete',
													action: url('clients', client.__id__, 'delete'),
													confirm: _("Are you sure?"), value: span({ class: 'fa fa-trash-o' }) })
												)]
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
