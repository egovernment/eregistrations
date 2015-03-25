'use strict';

var MultipleInput = require('dbjs-dom/input/_multiple'),
		ns = require('mano').domjs.ns,
		d = require('d'),
		_  = require('mano').i18n;

Object.defineProperties(MultipleInput.prototype, {
	addLabel: d(
		function () {
			return ns.a(
				{ class: 'dbjs-multiple-button-add hint-optional hint-optional-left',
					'data-hint': _("Add new item") },
				ns.span({ class: 'fa fa-plus-circle' }, _("Add"))
			);
		}
	),
	deleteLabel: d(
		function () {
			return ns.a(
				{ class: 'dbjs-multiple-button-remove hint-optional hint-optional-left',
					'data-hint': _("Remove this item") },
				ns.span({ class: 'fa fa-minus-circle' }, _("Remove"))
			);
		}
	)
});
