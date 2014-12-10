'use strict';
var generateId = require('time-uuid')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

/*
	return object of form:
	{
	affectedSectionId: id || undefined,
	legacyScript: radioMatch || selectMatch || undefined,
	formResolvent: field || undefined
	}
*/
module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getFormResolvent',
	d(function () {
		var result, match;
		result = {};
		match = {};
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
				result.formResolvent._dbjsInput.dom.classList.add('multiline');
				result.legacyScript = ns.legacy('radioMatch', this.domId,
						this.master.__id__ + '/' + this.constructor.resolventProperty,
					match);
			}
		}
		return result;
	}));
