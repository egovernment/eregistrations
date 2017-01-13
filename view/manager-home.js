// User Manager: Clients view

'use strict';

var _              = require('mano').i18n.bind('View: Manager')
  , db             = require('../db')
  , modalContainer = require('./components/modal-container');

exports._parent = require('./manager');

exports['manager-account-clients'] = { class: { active: true } };

exports._businessProcessesTypes = Function.prototype;

exports._createBpDialog = function (params) {
	var actionUrl, availableServices, client, derivationSources
	  , serviceSelectPrefix, derivationSourcesSelectPrefix, clientsProcesses;

	client            = params.client;
	actionUrl         = params.actionUrl || 'start-new-business-process-by-client/' + client.__id__;
	availableServices = params.availableServices;
	serviceSelectPrefix = 'start-new-service-bp-select' + client.__id__;
	derivationSourcesSelectPrefix = 'derive-new-service-bp-by-user-select-' + client.__id__;
	derivationSources = this.user.managedBusinessProcesses.filterByKey('canBeDerivationSource',
		true).and(
		client.initialBusinessProcesses
	);
	clientsProcesses = {};
	availableServices.filterByKey('isDerivable', true);

	availableServices.forEach(function (BusinessProcess) {
		if (BusinessProcess.prototype.isDerivable) {
			if (!clientsProcesses[BusinessProcess.__id__]) {
				clientsProcesses[BusinessProcess.__id__] = [];
			}
			clientsProcesses[BusinessProcess.__id__].push(derivationSourcesSelectPrefix,
					derivationSourcesSelectPrefix + '-label');
		}
	});

	return modalContainer.append(dialog(
		{ id: client.__id__,
			class: 'dialog-modal dialog-business-process-derive' },
		header(
			h3(_("Start a new service for client ${fullName}",
				{ fullName: client._fullName }))
		),
		section(
			{ class: 'dialog-body' },
			_if(availableServices._size, [
				form({ action: url(actionUrl), method: 'post' },
					ul(
						{ class: 'form-elements' },
						li({ class: 'input' },
							label({ for: serviceSelectPrefix },
								_("I want to start the following service"))),
						li({ class: 'input' },
							select({ name: 'BusinessProcessId', id: serviceSelectPrefix },
								list(availableServices,
									function (BusinessProcess) {
										return option({ value: BusinessProcess.__id__ },
											BusinessProcess.prototype.label);
									}))),
						li({ class: 'input', id: derivationSourcesSelectPrefix + '-label' },
								label({ for: derivationSourcesSelectPrefix },
									_("Select the entity for which you want to start the service"))),
						li({ class: 'input' },
							select({ name: 'initialProcess', id: derivationSourcesSelectPrefix },
								list(derivationSources,
									function (derivationSource) {
										return option({
											value: derivationSource.__id__
										},
											derivationSource._businessName);
									}),
								option({ value: 'notRegistered' }, _("An other business"))))
					),
					p(input({ type: 'submit', value: _("Start service") })),
					legacy('selectMatch', serviceSelectPrefix, clientsProcesses)
					)
			])
		)
	));
};

exports['manager-account-content'] = function () {
	var manager = this.user
	  , clients = manager.managedUsers
	  , businessProcessesTypes;

	businessProcessesTypes = exports._businessProcessesTypes.call(this) ||
		db.BusinessProcess.extensions;

	insert(_if(manager._isManagerActive,
		[p({ class: 'section-primary-legend' }, _("Here is your list of clients. " +
			"By clicking on the pen, you will arrive in their Client " +
			"Account where you will be able to start a service on their " +
			"name and see all their documents and data")),
			a({ href: url('new-client'), class: 'button-regular' },
				_("Add client"))], p({ class: 'section-primary-legend' },
			_("Your account is currently inactive"))));

	insert(_if(clients._size, function () {
		return section({ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table' },
				thead(tr(
					th(_("Client linked to this notary account")),
					th(_("Services started for this client")),
					_if(manager._isManagerActive, th({ colspan: "3" }))
				)),
				tbody(
					clients,
					function (client) {
						var bpSet = client.initialBusinessProcesses.and(manager.managedBusinessProcesses)
									.filterByKey('businessName')
						  , availableServices =
								businessProcessesTypes.and(client.servicesOpenForNewDraft);
						exports._createBpDialog.call(this,
							{ availableServices: availableServices, client: client });

						return tr(
							td(client._fullName),

							td(bpSet.map(function (bp) { return bp.constructor; })._size),
							_if(manager._isManagerActive,
								[
									td(
										_if(availableServices._size,
											a({
												class: 'button-submit',
												href: "#" + client.__id__
											}, _("Start a service for this client")))
									),
									td(
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
											})
											)
									)]
								)
						);
					},
					this
				)
			));
	}.bind(this),
		_if(manager._isManagerActive, p(_('You have no clients yet.')))));
};
