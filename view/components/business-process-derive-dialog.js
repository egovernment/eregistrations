'use strict';

var _              = require('mano').i18n.bind('View: Business Process Derive dialog')
  , ensureObject   = require('es5-ext/object/valid-object')
  , modalContainer = require('./modal-container');

module.exports = function (params) {
	var actionUrl, businessProcesses;
	ensureObject(params);
	actionUrl         = params.actionUrl;
	businessProcesses = params.businessProcesses;

	return modalContainer.append(dialog(
		{ id: params.id || 'derive',
			class: 'dialog-modal dialog-business-process-derive' },
		header(
			h3(params.headerText || _("Select a business to modify"))
		),
		section(
			{ class: 'dialog-body' },
			form({ action: url(actionUrl), method: 'post' },
				ul(
					{ class: 'form-elements' },
					li({ class: 'input' },
						label({ for: 'business-process-derive-select' },
							_("Please select a business to modify:"))),
					li({ class: 'input' },
						select({ name: 'initialProcess', id: 'business-process-derive-select' },
							list(businessProcesses.filterByKey('canBeDerivationSource', true),
								function (process) {
									return option({ value: process.__id__ }, process._businessName);
								}),
							option({ value: 'notRegistered' }, _("An other business"))))
				),
				p(input({ type: 'submit', value: _("Start service") })))
		)
	));
};
