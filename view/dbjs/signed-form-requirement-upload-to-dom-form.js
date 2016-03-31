"use strict";

var normalizeOptions = require('es5-ext/object/normalize-options')
  , db               = require('mano').db
  , d                = require('d')
  , _                = require('mano').i18n.bind('View: Signed Data Forms');

module.exports = Object.defineProperty(
	db.SignedDataFormsRequirementUpload.prototype,
	'toDOMForm',
	d(function (document/*, options */) {
		var opts = normalizeOptions(arguments[1]);
		opts.afterHeader = function (requirementUpload) {
			var checkbox;
			var needsConfirmation = and(requirementUpload.document.files.ordered._size,
				not(requirementUpload.document._isUpToDate));
			var result = [
				div(a({ href: '/print-forms-data/', target: '_blank' },
					_("Print your application form"))),
				// If the printed form is uploaded and might not be up to date,
				// the user should check the confirmation checkbox.
				insert(_if(needsConfirmation,
					p({ class: 'entities-overview-info' },
						requirementUpload.document.getDescriptor('isUpToDateByUser').label,
						' ',
						label({ class: 'signed-data-form-requirement-label' },
							checkbox = input({ name: requirementUpload.document.__id__ + '/isUpToDateByUser',
								type: 'checkbox', value: 1, checked: false }), ' ', _("Yes")))))
			];
			// Reset checkbox value at initialization and whenever we re-ask for confirmation
			checkbox.checked = false;
			needsConfirmation.on('change', function (event) {
				if (event.newValue) checkbox.checked = false;
			});
			return result;
		};

		return db.RequirementUpload.prototype.toDOMForm.call(this, document, opts);
	})
);
