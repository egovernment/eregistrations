'use strict';
var generateId = require('time-uuid')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

/*
return object of form:
{
	formId: id,
	affectedSectionId: id,
	radioMatch: radioMatch || undefined,
	formResolvent: field || undefined
}
*/
module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getFormResolvent',
	d(function (mainEntity/*, options */) {
		var result, match, options;
		result = {};
		match = {};
		options = Object(arguments[1]);
		result.formId = options.formId || generateId();
		result.affectedSectionId = generateId();
		if (this.resolventProperty) {
			if (typeof this.resolventValue === 'boolean') {
				match[Number(this.resolventValue)] = result.affectedSectionId;
			} else {
				match[this.resolventValue] = result.affectedSectionId;
			}
			result.formResolvent = ns.field({ dbjs: mainEntity.getObservable(this.resolventProperty) });
			result.radioMatch = ns.legacy('radioMatch', result.formId,
					mainEntity.__id__ + '/' + this.resolventProperty,
				match);
		}
		return result;
	}));
