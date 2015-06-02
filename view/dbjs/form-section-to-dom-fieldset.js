'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMFieldset: d(function (document/*, options */) {
		var resolvent, legacy, control, options = Object(arguments[1]), customizeData;
		customizeData = {};
		if (!this.forceRequiredInput) {
			control = { required: this.forceRequiredInput };
		}

		resolvent = this.getFormResolvent(options);
		legacy = this.getLegacy(options.formId, options);

		customizeData.arrayResult = [options.prepend,
			resolvent.formResolvent,
			customizeData.fieldset = ns.fieldset({
				id: resolvent.affectedSectionId,
				class: 'form-elements',
				dbjs: options.master || this.master,
				names: this.formPropertyNames,
				control: control,
				controls: legacy.controls
			}), options.append, resolvent.legacyScript, legacy.legacy];
		if (typeof options.customize === 'function') {
			customizeData.fieldset = customizeData.fieldset._dbjsFieldset;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
