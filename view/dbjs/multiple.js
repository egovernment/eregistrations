'use strict';

var MultipleInput = require('dbjs-dom/input/_multiple')
  , el            = require('dom-ext/document/#/make-element').bind(document)
  , d             = require('d')
  , _             = require('mano').i18n;

Object.defineProperties(MultipleInput.prototype, {
	addLabel: d(
		function () {
			var lHint = this.type.addLabelHint || _("Add new item");
			return el('a',
				{ class: 'dbjs-multiple-button-add hint-optional hint-optional-left',
					'data-hint': lHint },
				el('span', { class: 'fa fa-plus-circle' }, _("Add"))
				);
		}
	),
	deleteLabel: d(
		function () {
			var lHint = this.type.deleteLabelHint || _("Remove this item");
			return el('a',
				{ class: 'dbjs-multiple-button-remove hint-optional hint-optional-left',
					'data-hint': lHint },
				el('span', { class: 'fa fa-minus-circle' }, _("Remove"))
				);
		}
	)
});
