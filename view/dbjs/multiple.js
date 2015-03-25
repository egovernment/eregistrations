'use strict';

var MultipleInput = require('dbjs-dom/input/_multiple'),
		ns = require('mano').domjs.ns,
		d = require('d');

Object.defineProperties(MultipleInput.prototype, {
	addLabel: d(
		function () {
			return ns.a(
				{ class: 'dbjs-multiple-button-add hint-optional hint-optional-left',
					'data-hint': 'Add new item' },
				ns.span({ class: 'fa fa-plus-circle' }, "Add")
			);
		}
	),
	deleteLabel: d(
		function () {
			return ns.a(
				{ class: 'dbjs-multiple-button-remove hint-optional hint-optional-left',
					'data-hint': 'Remove this item' },
				ns.span({ class: 'fa fa-minus-circle' }, "Remove")
			);
		}
	)
});
