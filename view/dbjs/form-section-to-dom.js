'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMForm: d(function (document/*, options */) {
		var resolvent, legacy, actionUrl, options = Object(arguments[1]), url, control, customizeData
		  , master = options.master || this.master;
		customizeData = {};
		resolvent = this.getFormResolvent();
		legacy = this.getLegacy(this.domId, options);
		url = options.url || ns.url;
		actionUrl = url(this.constructor.actionUrl);
		if (options.isChildEntity) {
			actionUrl = (master.constructor.prototype === master) ?
					url(this.constructor.actionUrl + '-add') :
					url(this.constructor.actionUrl, this.master.__id__);
		}
		if (!this.forceRequiredInput) {
			control = { required: this.forceRequiredInput };
		}
		customizeData.arrayResult = [customizeData.container = ns.section({ class: 'section-primary' },
			ns.form(
				{ id: this.domId,
					method: 'post',
					action: actionUrl, class: ns._if(ns.eq(
					this._status,
					1
				), 'completed form-elements', 'form-elements') },
				ns._if(this._label,
					[ns.h2(this._label),
						ns.hr()]),
				options.prepend,
				resolvent.formResolvent,
				customizeData.fieldset = ns.fieldset(
					{ id: resolvent.affectedSectionId,
						dbjs: master, names: this.formPropertyNames,
						control: control,
						controls: legacy.controls }
				).extend(options.append),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit', value: _("Submit") })),
				ns.p({ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			)), resolvent.legacyScript, legacy.legacy];
		if (typeof options.customize === 'function') {
			customizeData.fieldset = customizeData.fieldset._dbjsFieldset;
			options.customize.call(this, customizeData);
		}
		return customizeData.arrayResult;
	})
});
