'use strict';

var d  = require('d')
  , db = require('../../db');

Object.defineProperties(db.User.prototype.getOwnDescriptor('roles'), {
	inputOptions: d({
		renderItem: function (input, label, value) {
			var el = this.make, isDisabled, rolesMetaEntry;
			rolesMetaEntry = this.observable.object.rolesMeta[value];
			isDisabled = rolesMetaEntry ? rolesMetaEntry._canBeDestroyed.map(function (canBeDestroyed) {
				return !canBeDestroyed;
			}) : false;

			input.dom.onclick = _if(isDisabled,
				'event.preventDefault ? event.preventDefault() : (event.returnValue = false)');

			return el('li', { class: [_if(isDisabled, "disabled")] }, el('label', input, " ", label));
		}
	})
});
