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
	d(function (formId/*, options */) {
		var result, legacyData, options;
		result = {};
		options = Object(arguments[1]);
		this.constructor.propertyNames.forEach(function (item, propName) {
			var val, id, resolved;
			resolved = resolvePropertyPath(this, propName);
			val = resolved.object.getDescriptor(db.Object.getApplicablePropName(resolved.key)
				)._value_;
			if (typeof val !== 'function') {
				return;
			}
			if (!legacyData) {
				legacyData = [];
			}
			if (!result.controls) {
				result.controls = {};
			}
			id = 'input-' + generateId();
			legacyData.push({ id: id, constraint: val, sKeyPath: propName });
			result.controls[resolved.object.__id__ + '/' + resolved.key] = { id: id };
		}, this.master);
		if (legacyData) {
			result.legacy = ns.legacy('formSectionStateHelper', formId, this.master.__id__,
				legacyData, options.legacyEntityProto);
		}

		return result;
	}));
