// User Manager: Requests view

'use strict';

var _                  = require('mano').i18n.bind('View: Manager')
  , db                 = require('../db')
  , tableColumns       = require('./components/table-columns')
  , formatLastModified = require('./utils/last-modified')
  , camelToHyphen      = require('es5-ext/string/#/camel-to-hyphen')
  , modalContainer     = require('./components/modal-container')

  , actionsColumn      = tableColumns.businessProcessActionsColumn
  , getServiceIcon     = tableColumns.getServiceIcon
  , renderServiceBox   = require('./components/render-service-box');

exports._parent = require('./manager');

exports['manager-account-requests'] = { class: { active: true } };

exports._createBpDialog = function (params) {
	var actionUrl, BusinessProcess, manager, bpHyphened;
	manager = this.user;
	BusinessProcess = params.BusinessProcess;
	bpHyphened      = camelToHyphen.call(BusinessProcess.__id__);
	actionUrl       = params.actionUrl || 'start-new-business-process/' + bpHyphened;

	return modalContainer.append(dialog(
		{ id: bpHyphened,
			class: 'dialog-modal dialog-business-process-derive' },
		header(
			h3(_("Select a client, for which you would like to start a new service."))
		),
		section(
			{ class: 'dialog-body' },
			form({ action: url(actionUrl), method: 'post' },
				ul(
					{ class: 'form-elements' },
					li({ class: 'input' },
						label({ for: 'business-process-derive-select' },
							_("Please select client"))),
					li({ class: 'input' },
						select({ name: 'client', id: 'client-select' },
							list(manager.managedUsers,
								function (managedUser) {
									return option({ value: managedUser.__id__ }, managedUser._fullName);
								})))
				),
				p(input({ type: 'submit', value: _("Start service") })))
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

	insert([
		h3({ class: 'user-account-section-title' }, _("Available services")),
		p({ class: "section-primary-legend" }, "Manager - available services explanation"),
		section({ class: 'section-primary' },
			ul({ class: 'user-account-service-boxes' },
				exports._servicesBoxList.call(this),
				renderServiceBox))
	]);
};
