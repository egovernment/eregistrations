'use strict';
var d  = require('d')
  , generateId = require('time-uuid')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

/*
return object of form:
{
controls: ids || undefined,
legacy: lagacyScript || undefined
}
*/
module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getLegacy',
	d(function (formId) {
		var result, legacyData;
		result = {};
		this.formPropertyNames.forEach(function (item, propName) {
			var val, id, resolved;
			resolved = resolvePropertyPath(this, propName);
			val = resolved.object.getDescriptor(db.Object.createFormApplicableName(resolved.key))._value_;
			if (val === undefined) {
				return;
			}
			if (!legacyData) {
				legacyData = [];
			}
			if (!result.controls) {
				result.controls = {};
			}
			id = 'input-' + generateId();
			legacyData.push({ id: id, constrain: val });
			result.controls[resolved.object.__id__ + '/' + resolved.key] = { id: id };
		}, this.master);
		if (legacyData) {
			result.legacy = ns.legacy('formSectionStateHelper', formId, this.master.__id__, legacyData);
		}

		return result;
	}));
