/**
	* @returns {Object} - the object of the form:
	* {
	*  controls: ids || undefined,
	*  legacy: lagacyScript || undefined
	* }
	*/
'use strict';

var forEach             = require('es5-ext/object/for-each')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , d                   = require('d')
  , generateId          = require('time-uuid')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')

  , db = require('mano').db
  , ns = require('mano').domjs.ns;

module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getLegacy',
	d(function (formId/*, options */) {
		var result, legacyData, options = Object(arguments[1]), master;
		master = options.master || this.master;
		result = {};
		result.controls = {};
		this.constructor.propertyNames.forEach(function (item, propName) {
			var val, id, resolved, formFieldPath, propOptions;
			resolved = resolvePropertyPath(master, propName);
			formFieldPath = resolved.id;
			if (this.inputOptions.has(propName)) {
				propOptions = normalizeOptions(this.inputOptions.get(propName));
				forEach(propOptions, function (value, name) {
					if (typeof value !== 'function') return;
					if (!value.isOptionResolver) return;
					propOptions[name] = value.call(this);
				});
				result.controls[formFieldPath] = propOptions;
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
			legacyData.push({ id: id, constraint: val, sKeyPath: propName, sKey: formFieldPath });
			result.controls[formFieldPath] = normalizeOptions(result.controls[formFieldPath], { id: id });
		}, this);
		if (legacyData) {
			result.legacy = ns.legacy('formSectionStateHelper', formId, master.__id__,
				legacyData, options.legacyEntityProto);
		}

		return result;
	}));
