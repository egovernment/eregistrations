'use strict';
var generateId = require('time-uuid')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

/*
	return object of form:
	{
	formId: id,
	affectedSectionId: id || undefined,
	legacyScript: radioMatch || selectMatch || undefined,
	formResolvent: field || undefined
	}
*/
module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getFormResolvent',
	d(function (/*, options */) {
		var result, match, options;
		result = {};
		match = {};
		options = Object(arguments[0]);
		result.formId = options.formId || 'form-' + generateId();
		if (this.constructor.resolventProperty) {
			result.affectedSectionId = generateId();
			if (typeof this.resolventValue === 'boolean') {
				match[Number(this.resolventValue)] = result.affectedSectionId;
			} else {
				match[this.resolventValue] = result.affectedSectionId;
			}
			result.formResolvent = ns.field({ dbjs: resolvePropertyPath(this.master,
				this.constructor.resolventProperty
				).observable });
			if (result.formResolvent._dbjsInput instanceof db.Base.DOMSelect) {
				result.formResolvent._dbjsInput.control.id = 'select-' + generateId();
				result.legacyScript = ns.legacy('selectMatch',
					result.formResolvent._dbjsInput.control.id,
					match);
			} else {
				result.legacyScript = ns.legacy('radioMatch', result.formId,
						this.master.__id__ + '/' + this.constructor.resolventProperty,
					match);
			}
		}
		return result;
	}));
