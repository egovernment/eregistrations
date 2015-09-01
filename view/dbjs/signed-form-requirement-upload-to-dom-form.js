"use strict";

var normalizeOptions = require('es5-ext/object/normalize-options')
  , db               = require('mano').db
  , d                = require('d')
  , _                = require('mano').i18n.bind('View: Signed Data Forms');

module.exports = Object.defineProperty(
	db.BusinessProcessMerchant.prototype.requirementUploads.map.get('signedDataForms'),
	'toDOMForm',
	d(function (document/*, options */) {
		var opts = normalizeOptions(arguments[1]);
		opts.afterHeader = function (requirementUpload) {
			return [
				div(a({ href: '/imprimir-usuario-data/', target: '_blank' },
					_("Print your application form"))),
				// If the printed form is uploaded and might not be up to date,
				// the user should check the confirmation checkbox.
				insert(_if(and(requirementUpload.document.files.ordered._size,
						not(requirementUpload.document._isUpToDate)),
					p(label(
						requirementUpload.document.getDescriptor('isUpToDateByUser').label,
						' ',
						input({
							name: requirementUpload.document.__id__ + '/isUpToDateByUser',
							checked: false,
							type: 'checkbox',
							value: '1'
						})
					)
						)
					))];
		};
		return this.constructor.prototype.toDOMForm.call(this, document, opts);
	})
);
