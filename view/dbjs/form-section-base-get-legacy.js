/** @param {string} - identifier of the form
 * @param options {object}
 * @returns {object} - the object of the form:
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
  , isNested            = require('dbjs/is-dbjs-nested-object')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')

  , db = require('mano').db
  , ns = require('mano').domjs.ns;

module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getLegacy',
	d(function (formId/*, options */) {
		var result, legacyData, options = Object(arguments[1]), master;
		master = options.master || this.master;
		result = {};
		result.controls = {};
		this.formPropertyNames.forEach(function (item, propName) {
			var val, id, resolved, formFieldPath, propOptions, defaultOptions = {}, ownerMap;
			resolved = resolvePropertyPath(master, propName);
			if (!resolved) {
				throw new Error("Could not resolve property " +
					"'" + propName + "' on an object of type " +
					master.constructor.__id__ + ". Check your model.");
			}
			formFieldPath = resolved.id;
			if (isNested(this.propertyMaster) &&
					// Ensure it's really instance of NestedMap
					(this.propertyMaster.owner.owner instanceof db.NestedMap) &&
					// Ensure it's not about nested property in propertyMaster, otherwise resolved.key
					// may accidentally match
					(resolved.object === this.propertyMaster)) {
				if (this.propertyMaster.owner.owner.cardinalPropertyKey === resolved.key) {
					defaultOptions = { required: true };
				}
			}
			ownerMap = isNested(this.propertyMaster) && this.propertyMaster.owner &&
					this.propertyMaster.owner.owner;
			if (ownerMap && ownerMap.cardinalPropertyKey === resolved.key) {
				defaultOptions = { required: true };
			}
			propOptions = defaultOptions;
			if (this.inputOptions.has(propName)) {
				propOptions = normalizeOptions(propOptions, this.inputOptions.get(propName));
				forEach(propOptions, function (value, name) {
					if (typeof value !== 'function') return;
					if (!value.isOptionResolver) return;
					propOptions[name] = value.call(this);
				});
			}
			result.controls[formFieldPath] = propOptions;
			val = resolved.object.getDescriptor(db.Object.getApplicablePropName(resolved.key)
				)._value_;
			if (typeof val !== 'function') {
				return;
			}
			if (!legacyData) {
				legacyData = [];
			}
			id = (propOptions && propOptions.id) || 'input-' + generateId();
			legacyData.push({ id: id, constraint: val, sKeyPath: propName, sKey: formFieldPath });
			result.controls[formFieldPath] = normalizeOptions(result.controls[formFieldPath], { id: id });
		}, this);
		if (legacyData) {
			result.legacy = ns.legacy('formSectionStateHelper', formId, master.__id__,
				legacyData, options.legacyEntityProto);
		}

		return result;
	}));
