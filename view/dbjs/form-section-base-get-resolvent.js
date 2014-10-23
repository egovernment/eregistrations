'use strict';
var generateId = require('time-uuid')
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
		if (this.resolventProperty) {
			result.formId = options.formId || generateId();
			result.affectedSectionId = generateId();
			if (typeof this.resolventValue === 'boolean') {
				match[Number(this.resolventValue)] = result.affectedSectionId;
			} else {
				match[this.resolventValue] = result.affectedSectionId;
			}
			result.formResolvent = ns.field({ dbjs: this.master.getObservable(this.resolventProperty) });
			result.radioMatch = ns.legacy('radioMatch', result.formId,
					this.master.__id__ + '/' + this.resolventProperty,
				match);
		}
		return result;
	}));
