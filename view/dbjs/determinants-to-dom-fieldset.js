'use strict';

var _                   = require('mano').i18n.bind('User')
  , d                   = require('d')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , normalizeOptions    = require('es5-ext/object/normalize-options');

module.exports = function (target) {
	Object.defineProperties(target, {
		toDOMFieldset: d(function (document/*, options*/) {
			var options = normalizeOptions(arguments[1]), targetId;

			target.propertyNames.some(function (name) {
				var resolved;
				resolved = resolvePropertyPath(this.master, name);
				if (resolved && resolved.descriptor.isInventoryTotal) {
					targetId = resolved.id;
					return true;
				}
			}, this);
			options.customize = function (data) {
				var fieldset = data.fieldset;

				normalize(fieldset.items[targetId].dom).after(
					div({ class: 'user-guide-inventory-button' },
						a({ href: '#inventory' },
							span({ class: 'fa fa-calculator user-guide-inventory-icon' }, _("Calculator")),
							span({ class: 'user-guide-inventory-label' }, _("Calculate the amount"))))
				);
			};
			return this.constructor.prototype.toDOMFieldset.call(this, document, options);
		})
	});
};
