'use strict';

var MultipleInput = require('dbjs-dom/input/_multiple'),
		el = require('dom-ext/document/#/make-element').bind(document),
		d = require('d'),
		_  = require('mano').i18n;

Object.defineProperties(MultipleInput.prototype, {
	addLabel: d(
		function () {
			return el('a',
				{ class: 'dbjs-multiple-button-add hint-optional hint-optional-left',
					'data-hint': _("Add new item") },
				el('span', { class: 'fa fa-plus-circle' }, _("Add"))
				);
		}
	),
	deleteLabel: d(
		function () {
			return el('a',
				{ class: 'dbjs-multiple-button-remove hint-optional hint-optional-left',
					'data-hint': _("Remove this item") },
				el('span', { class: 'fa fa-minus-circle' }, _("Remove"))
				);
		}
	)
});
