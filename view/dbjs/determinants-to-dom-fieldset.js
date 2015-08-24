'use strict';

var d  = require('d')
  , db = require('mano').db
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , _ = require('mano').i18n.bind('User');

require('./form-section-base');

module.exports = function (/* options */) {
	console.log('jest');
	var businessProcessProto, opts = Object(arguments[0]);
	businessProcessProto = (opts.target && opts.target.prototype) || db.BusinessProcess.prototype;
	Object.defineProperties(businessProcessProto.determinants, {
		toDOMFieldset: d(function (document/*, options*/) {
			var options = normalizeOptions(arguments[1]), targetId;

			businessProcessProto.determinants.propertyNames.some(function (name) {
				var resolved;
				resolved = resolvePropertyPath(this.master, name);
				if (resolved && resolved.descriptor.isInventoryTotal) {
					targetId = resolved.id;
					return true;
				}
			}, this);
			options.customize = function (data) {
				var fieldset = data.fieldset;
				console.log(fieldset.items[targetId]);
				normalize(fieldset.items[targetId].dom).after(
					div({ class: 'user-guide-inventory-button' },
						a({ href: '#inventory' },
							span({ class: 'fa fa-calculator user-guide-inventory-icon' }, _("Calculator")),
							span({ class: 'user-guide-inventory-label' }, _("Calculate the amount"))))
				);
			};
			return db.FormSection.prototype.toDOMFieldset.call(this, document, options);
		})
	});
};
