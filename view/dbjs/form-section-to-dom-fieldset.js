/** Renders fieldset of a FormSection object
 * @param document {object} - document object, usually DOM
 * @param options {object} -
 * {
 *  append {object} - domjs object to append
 *  customize {function} - customization callback
 *  formId {string} - the id of the parent form
 *  master {object} - by default section's master object
 *  prepend {object} - domjs object to prepend
 * }
 * @returns {array} - array of constructed domjs elements
 */
'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , normalizeOptions = require('es5-ext/object/normalize-options');

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMFieldset: d(function (document/*, options */) {
		var resolvent, legacy, control, options = normalizeOptions(arguments[1]),
			customizeData, master;
		master = options.master || this.master;
		customizeData = { master: master };
		if (!this.disablePartialSubmit) {
			control = { required: false };
		}

		resolvent = this.getFormResolvent(options);
		legacy = this.getLegacy(options.formId, options);
		customizeData.arrayResult = [options.prepend,
			resolvent.formResolvent,
			require('../components/progress-rules')(this),
			customizeData.fieldset = ns.fieldset(normalizeOptions({
				id: resolvent.affectedSectionId,
				class: 'form-elements',
				dbjs: master,
				names: this.formApplicablePropertyNames,
				control: control,
				controls: legacy.controls
			}, options.fieldsetOptions)), options.append, resolvent.legacyScript, legacy.legacy];
		if (typeof options.customize === 'function') {
			customizeData.fieldset = customizeData.fieldset._dbjsFieldset;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
