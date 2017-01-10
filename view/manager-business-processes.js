// User Manager: Requests view

'use strict';

var _                  = require('mano').i18n.bind('View: Manager')
  , db                 = require('../db')
  , tableColumns       = require('./components/table-columns')
  , formatLastModified = require('./utils/last-modified')
  , camelToHyphen      = require('es5-ext/string/#/camel-to-hyphen')
  , uncapitalize       = require('es5-ext/string/#/uncapitalize')
  , modalContainer     = require('./components/modal-container')

  , actionsColumn      = tableColumns.businessProcessActionsColumn
  , getServiceIcon     = tableColumns.getServiceIcon
  , renderServiceBox   = require('./components/render-service-box');

exports._parent = require('./manager');

exports['manager-account-requests'] = { class: { active: true } };

exports._createBpDialog = function (params) {
	var actionUrl, BusinessProcess, manager, bpHyphened, serviceName
	  , availableClients, derivationSources;

	manager = this.user;
	BusinessProcess = params.BusinessProcess;
	serviceName     = uncapitalize.call(BusinessProcess.__id__.slice('BusinessProcess'.length));
	bpHyphened      = camelToHyphen.call(BusinessProcess.__id__);
	actionUrl       = params.actionUrl || 'start-new-business-process/' + bpHyphened;
	availableClients = manager.managedUsers.and(db.User.instances.filterByKeyPath('services/' +
		serviceName + '/isOpenForNewDraft', true));
	derivationSources = manager.managedBusinessProcesses.and(
		db.BusinessProcess.instances.filterByKey('canBeDerivationSource', true)
	);

	return modalContainer.append(dialog(
		{ id: bpHyphened,
			class: 'dialog-modal dialog-business-process-derive' },
		header(
			h3(_("Start a new service for a client"))
		),
		section(
			{ class: 'dialog-body' },
			_if(availableClients._size, [
				form({ action: url(actionUrl), method: 'post' },
					ul(
						{ class: 'form-elements' },
						li({ class: 'input' },
							label({ for: 'client-select' + bpHyphened },
								_("I want to run the service for the following client"))),
						li({ class: 'input' },
							select({ name: 'client', id: 'client-select' + bpHyphened },
								list(availableClients,
									function (managedUser) {
										return option({ value: managedUser.__id__ }, managedUser._fullName);
									}))),
						_if(and(derivationSources._size, BusinessProcess.prototype.isDerivable), [
							li({ class: 'input' },
								label({ for: 'derivation-source-select' + bpHyphened },
									_("Select the entity for which you want to start the service"))),

							li({ class: 'input' }),
							select({ name: 'initialProcess', id: 'derivation-source-select' + bpHyphened },
								list(derivationSources,
									function (derivationSource) {
										return option({ value: derivationSource.__id__ },
											derivationSource._businessName);
									}))])
					),

					p(input({ type: 'submit', value: _("Start service") }))),
				hr()
			]),
			p(a({ class: 'button-regular', href: 'new-client' }, _("I want to create a new client")))
		)
	));
};

exports._servicesBoxList = function () {
	var serviceBoxes = [];

	db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
		exports._createBpDialog.call(this, {
			BusinessProcess: BusinessProcess
		});
		serviceBoxes.push({
			hrefUrl: '#' + camelToHyphen.call(BusinessProcess.__id__),
			buttonContent:  div({ class: 'user-account-service-button' },
				getServiceIcon(BusinessProcess.prototype),
				BusinessProcess.prototype.registerServiceLabel),
			content: span(BusinessProcess.prototype.serviceDescription),
			disabledCondition: eq(this.user._isManagerActive, false)
		});
	}, this);

	return serviceBoxes;
};

exports['manager-account-content'] = function () {
	var requests = this.user.managedBusinessProcesses, user = this.user;

	insert(_if(not(this.user._isManagerActive),
		p({ class: 'section-primary-legend' }, _("Your account is currently inactive")),
		p({ class: 'section-primary-legend' }, _("Here is the list of " +
			"requests that you have started " +
			"in the name of your client. " +
			"Click on the pen to modify the request or on the " +
			"magnifying glass to see the status of the registration."))));

	insert(_if(requests._size, function () {
		return section({ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table' },
				thead(tr(
					th(_("Service")),
					th(_("Client")),
					th(_('Entity')),
					th(_('Submission date')),
					th(_('State')),
					th()
				)),
				tbody(
					requests,
					function (businessProcess) {
						return tr(
							td({ class: 'submitted-user-data-table-service' },
								span({ class: 'hint-optional hint-optional-right',
										'data-hint': businessProcess._label },
									getServiceIcon(businessProcess))),
							td(resolve(businessProcess._user, '_fullName')),
							td(businessProcess._businessName),
							td(_if(businessProcess._isSubmitted, function () {
								return businessProcess._isSubmitted._lastModified.map(formatLastModified);
							})),
							td(businessProcess._status),
							td({ class: 'actions' }, _if(user._isManagerActive,
								actionsColumn.data(businessProcess), _("N/A")))
						);
					}
				)
			));
	}.bind(this),
		_if(this.user._isManagerActive, p(_('You have no requests yet.')))));

	insert(_if(this.user._isManagerActive, [
		h3({ class: 'user-account-section-title' }, _("Available services")),
		p({ class: "section-primary-legend" }, "Manager - available services explanation"),
		section({ class: 'section-primary' },
			ul({ class: 'user-account-service-boxes' },
				exports._servicesBoxList.call(this),
				renderServiceBox))
	]));
};
