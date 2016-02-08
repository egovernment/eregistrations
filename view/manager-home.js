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
					clients.toArray(function (client1, client2) {
						return client1.fullName.localeCompare(client2.fullName);
					}),
					function (client) {
						return tr(
							td(client._fullName),

							td(mmap(client._businessProcesses, function (bpSet) {
								//check if they are managed by current user
								var currentManager = this.user;
								return bpSet.filter(function (bp) {
									return bp.manager && bp.manager.__id__ === currentManager.__id__;
								}).toArray().map(function (bp) {
									return bp.businessName;
								}).filter(function (bpName) {
									return bpName;
								}).join(', ');
							}, this)),

							td(mmap(client._businessProcesses, function (bpSet) {
								return bpSet.map(function (bp) {
									return bp.label;
								}).toArray().join(', ');
							})),

							td(span(client._email),
								_if(client.roles._size, span('✅'))),

							td({ class: 'actions' },
								a({ href:  url('clients', client.__id__) },
									span({ class: 'fa fa-edit' })))
						);
					},
					this
				)
			));
	}.bind(this),
		md(_('You have no clients yet.'))));
};
