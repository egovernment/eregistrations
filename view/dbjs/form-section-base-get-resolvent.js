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

var generateId          = require('time-uuid')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , isObject            = require('dbjs/is-dbjs-object')
  , d                   = require('d')
  , db                  = require('mano').db
  , ns                  = require('mano').domjs.ns;

module.exports = Object.defineProperty(db.FormSectionBase.prototype, 'getFormResolvent',
	d(function (/*options*/) {
		var result, match, options = Object(arguments[0])
		  , master = options.master || this.master, dbjsInput;
		result = {};
		match = {};
		if (this.resolventProperty) {
			result.affectedSectionId = generateId();
			if (typeof this.resolventValue === 'boolean') {
				match[Number(this.resolventValue)] = result.affectedSectionId;
			} else if (isObject(this.resolventValue)) {
				match[this.resolventValue.__id__] = result.affectedSectionId;
			} else {
				match[this.resolventValue] = result.affectedSectionId;
			}
			result.formResolvent = ns.field({ dbjs: resolvePropertyPath(master,
				this.resolventProperty
				).observable });
			dbjsInput = result.formResolvent._dbjsInput;
			if (dbjsInput instanceof db.Base.DOMSelect) {
				dbjsInput.control.id = 'select-' + generateId();
				result.legacyScript = ns.legacy('selectMatch',
					dbjsInput.control.id,
					match);
			} else {
				if (!(dbjsInput.observable.descriptor.inputOptions &&
					(dbjsInput.observable.descriptor.inputOptions.multiline === false))) {
					dbjsInput.dom.classList.add('multiline');
				}
				result.legacyScript = ns.legacy('radioMatch', this.domId,
						master.__id__ + '/' + this.resolventProperty,
					match);
			}
		}
		return result;
	}));
