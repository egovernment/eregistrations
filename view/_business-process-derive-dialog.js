'use strict';

var _ = require('mano').i18n.bind('View: Business Process Derive dialog');

module.exports = function (context) {
	return dialog(
		{ id: 'business-process-derive-dialog',
			class: 'dialog-modal dialog-business-process-derive' },
		header(
			h3(_("Select a business to modify"))
		),
		section(
			{ class: 'dialog-body' },
			form({ action: url('business-process-derive'), method: 'post' },
				ul(
					{ class: 'form-elements' },
					li({ class: 'input' },
						label({ for: 'business-process-derive-select' },
							_("Please select a business to modify:"))),
					li({ class: 'input' },
						select({ name: 'initialProcess', id: 'business-process-derive-select' },
							list(context.user.businessProcesses.filterByKey('canBeDerivationSource', true),
								function (process) {
									return option({ value: process.__id__ }, process._businessName);
								}),
							option({ value: 'notRegistered' }, _("An other business"))))
				),
				p(input({ type: 'submit', value: _("Start service") })))
		)
	);
};
