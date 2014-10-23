'use strict';
var generateId = require('time-uuid')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

/*
return object of form:
{
	formId: id || undefined,
	affectedSectionId: id || undefined,
	radioMatch: radioMatch || undefined,
	formResolvent: field || undefined
}
*/
module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getFormResolvent',
	d(function (/*, options */) {
		var result, match, options;
		result = {};
		match = {};
		options = Object(arguments[0]);
		if (this.constructor.resolventProperty) {
			result.formId = options.formId || generateId();
			result.affectedSectionId = generateId();
			if (typeof this.constructor.resolventValue === 'boolean') {
				match[Number(this.constructor.resolventValue)] = result.affectedSectionId;
			} else {
				match[this.constructor.resolventValue] = result.affectedSectionId;
			}
			result.formResolvent = ns.field({ dbjs: resolvePropertyPath(this.master,
				this.constructor.resolventProperty
				).value });
			result.radioMatch = ns.legacy('radioMatch', result.formId,
					this.master.__id__ + '/' + this.constructor.resolventProperty,
				match);
		}
		return result;
	}));
