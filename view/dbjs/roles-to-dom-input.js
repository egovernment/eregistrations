'use strict';

var d  = require('d')
  , db = require('../../db');

Object.defineProperties(db.User.prototype.getOwnDescriptor('roles'), {
	inputOptions: d({
		renderItem: function (input, label, value) {
			var el = this.make, disabled, rolesMetaEntry, resultItem;
			rolesMetaEntry = this.observable.object.rolesMeta[value];
			disabled = rolesMetaEntry ? rolesMetaEntry._canBeDestroyed.map(function (canBeDestroyed) {
				return !canBeDestroyed;
			}) : false;

			resultItem = el('li', { class: [_if(disabled, "disabled")] }, el('label', input, " ", label));
			resultItem.addEventListener('click', function (ev) {
				if (this.classList.contains("disabled")) {
					ev.preventDefault();
				}
			});

			return resultItem;
		}
	})
});
