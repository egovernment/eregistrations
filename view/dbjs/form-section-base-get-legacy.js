'use strict';
var d  = require('d')
  , generateId = require('time-uuid')
  , assign = require('es5-ext/object/assign')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , normalizeOptions = require('es5-ext/object/normalize-options')
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
		var result, legacyData, options, inputOptions;
		result = {};
		result.controls = {};
		options = Object(arguments[1]);
		inputOptions = normalizeOptions(this.inputOptions) || {};
		this.constructor.propertyNames.forEach(function (item, propName) {
			var val, id, resolved, formFieldPath;
			resolved = resolvePropertyPath(this, propName);
			formFieldPath = resolved.object.__id__ + '/' + resolved.key;
			if (inputOptions[propName]) {
				result.controls[formFieldPath] = assign(result.controls[formFieldPath] || {},
					inputOptions[propName]);
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
			result.controls[formFieldPath] = assign(result.controls[formFieldPath] || {}, { id: id });
		}, this.master);
		if (legacyData) {
			result.legacy = ns.legacy('formSectionStateHelper', formId, this.master.__id__,
				legacyData, options.legacyEntityProto);
		}

		return result;
	}));
