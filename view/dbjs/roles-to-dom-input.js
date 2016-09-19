'use strict';

var d  = require('d')
  , db = require('mano').db;

Object.defineProperties(db.User.prototype.getOwnDescriptor('roles'), {
	inputOptions: d({
		renderItem: function (input, label, value) {
			var el = this.make, disabled, rolesMetaEntry;
			rolesMetaEntry = this.observable.object.rolesMeta[value];
			disabled = rolesMetaEntry ? rolesMetaEntry._canBeDestroyed.map(function (canBeDestroyed) {
				return !canBeDestroyed;
			}) : false;

			return el('li',  { disabled: disabled }, el('label', input, " ", label));
		}
	})
});
