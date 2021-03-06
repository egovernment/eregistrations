/** Renders fieldset of a FormSection object
 * @param document {object} - document object, usually DOM
 * @param options {object} -
 * {
 *  append {object} - domjs object to append
 *  customize {function} - customization callback
 *  formId {string} - the id of the parent form
 *  master {object} - by default section's master object
 *  prepend {object} - domjs object to prepend
 *  fieldsetAppend {array} - array of custom domjs fields to include
 * }
 * @returns {array} - array of constructed domjs elements
 */
'use strict';

var d                   = require('d')
  , db                  = require('mano').db
  , ns                  = require('mano').domjs.ns
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , progressRules       = require('../components/progress-rules')
  , readOnlyRender      = require('../utils/read-only-render');

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMFieldset: d(function (document/*, options */) {
		var options        = normalizeOptions(arguments[1])
		  , master         = options.master || this.master
		  , propertyMaster = this.propertyMaster
		  , customizeData  = { master: master }
		  , resolvent      = this.getFormResolvent(options)
		  , legacy         = this.getLegacy(options.formId, options)
		  , controls       = legacy.controls
		  , control, disablePartialSubmit;

		disablePartialSubmit = options.disablePartialSubmit != null ? options.disablePartialSubmit
			: this.disablePartialSubmit;

		if (!disablePartialSubmit) {
			control = { required: false };
		}

		this.readOnlyPropertyNames.forEach(function (propName) {
			propName = resolvePropertyPath(propertyMaster, propName).id;

			controls[propName].readOnlyRender = true;
			controls[propName].render = readOnlyRender;
		});

		//We want finegrained controle over controls option for fieldset
		if (options.fieldsetOptions && options.fieldsetOptions.controls) {
			options.fieldsetOptions.controls =
				normalizeOptions(controls, options.fieldsetOptions.controls);
		}

		customizeData.arrayResult = [
			options.prepend,
			resolvent.formResolvent,
			progressRules(this),
			customizeData.fieldset = ns.fieldset(normalizeOptions({
				id: resolvent.affectedSectionId,
				class: 'form-elements',
				dbjs: master,
				names: this.formApplicablePropertyNames,
				control: control,
				controls: controls,
				append: options.fieldsetAppend
			}, options.fieldsetOptions)),
			options.append,
			resolvent.legacyScript,
			legacy.legacy
		];

		if (typeof options.customize === 'function') {
			customizeData.fieldset = customizeData.fieldset._dbjsFieldset;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
