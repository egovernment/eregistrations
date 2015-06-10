/**
 * @param options {object}
 * @returns {object} of the form:
 * {
 *  affectedSectionId: id || undefined,
 *  legacyScript: radioMatch || selectMatch || undefined,
 *  formResolvent: field || undefined
 * }
 */
'use strict';

var generateId = require('time-uuid')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getFormResolvent',
	d(function (/*options*/) {
		var result, match, options = Object(arguments[0])
		  , master = options.master || this.master;
		result = {};
		match = {};
		if (this.constructor.resolventProperty) {
			result.affectedSectionId = generateId();
			if (typeof this.resolventValue === 'boolean') {
				match[Number(this.resolventValue)] = result.affectedSectionId;
			} else if (typeof this.resolventValue === 'object') {
				match[this.resolventValue.__id__] = result.affectedSectionId;
			} else {
				match[this.resolventValue] = result.affectedSectionId;
			}
			result.formResolvent = ns.field({ dbjs: resolvePropertyPath(master,
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
						master.__id__ + '/' + this.constructor.resolventProperty,
					match);
			}
		}
		return result;
	}));
