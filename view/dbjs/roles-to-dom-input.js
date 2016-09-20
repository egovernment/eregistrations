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

			if (isDisabled) {
				var onIsDisabledChanged = function () {
					if (isDisabled.value) {
						input.dom.setAttribute('onclick',
							'event.preventDefault ? event.preventDefault() : (event.returnValue = false)');
					} else {
						input.dom.removeAttribute('onclick');
					}
				};
				isDisabled.on('change', onIsDisabledChanged);
				onIsDisabledChanged();
			}

			return el('li', { class: [_if(isDisabled, "disabled")] }, el('label', input, " ", label));
		}
	})
});
