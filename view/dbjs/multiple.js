'use strict';

var MultipleInput = require('dbjs-dom/input/_multiple'),
		ns = require('mano').domjs.ns;

MultipleInput.prototype.addLabel = function () {
	return ns.a(
		{ class: 'dbjs-multiple-button-add hint-optional hint-optional-left',
			'data-hint': 'Add new item' },
		ns.span({ class: 'fa fa-plus-circle' }, "Add")
	);
};

MultipleInput.prototype.deleteLabel = function () {
	return ns.a(
		{ class: 'dbjs-multiple-button-remove hint-optional hint-optional-left',
			'data-hint': 'Remove this item' },
		ns.span({ class: 'fa fa-minus-circle' }, "Remove")
	);
};
