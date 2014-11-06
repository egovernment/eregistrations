'use strict';
var d  = require('d')
  , generateId = require('time-uuid')
  , assign = require('es5-ext/object/assign')
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
		var result, legacyData, options, self;
		self = this;
		result = {};
		result.controls = {};
		options = Object(arguments[1]);
		this.constructor.propertyNames.forEach(function (item, propName) {
			var val, id, resolved, formFieldPath;
			resolved = resolvePropertyPath(this, propName);
			formFieldPath = resolved.object.__id__ + '/' + resolved.key;
			if (self.inputOptions.has(propName)) {
				result.controls[formFieldPath] = self.inputOptions.get(propName);
			}
			val = resolved.object.getDescriptor(db.Object.getApplicablePropName(resolved.key)
				)._value_;
			if (typeof val !== 'function') {
				return;
			}
			if (!legacyData) {
				legacyData = [];
			}
			id = 'input-' + generateId();
			legacyData.push({ id: id, constraint: val, sKeyPath: propName });
			if (result.controls[formFieldPath]) {
				result.controls[formFieldPath] = assign(result.controls[formFieldPath], { id: id });
			} else {
				result.controls[formFieldPath] = { id: id };
			}
		}, this.master);
		if (legacyData) {
			result.legacy = ns.legacy('formSectionStateHelper', formId, this.master.__id__,
				legacyData, options.legacyEntityProto);
		}

		return result;
	}));
