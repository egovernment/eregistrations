'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMForm: d(function (document/*, options */) {
		var resolvent, legacy, actionUrl, options, url, control;
		options = Object(arguments[1]);
		resolvent = this.getFormResolvent();
		legacy = this.getLegacy(this.domId, options);
		url = options.url || ns.url;
		actionUrl = url(this.constructor.actionUrl);
		if (options.isChildEntity) {
			actionUrl = this.master.constructor.prototype === this.master ?
					url(this.constructor.actionUrl + '-add') :
					url(this.constructor.actionUrl, this.master.__id__);
		}
		if (!this.forceRequiredInput) {
			control = { required: this.forceRequiredInput };
		}
		return ns.section({ class: 'section-primary' },
			ns.form(
				{ id: this.domId,
					method: 'post',
					action: actionUrl, class: ns._if(ns.eq(
					this.status,
					1
				), 'completed') },
				ns._if(this.constructor.label,
					[ns.h2(this.constructor.label),
						ns.hr()]),
				resolvent.formResolvent,
				ns.fieldset(
					{ id: resolvent.affectedSectionId, class: 'form-elements',
						dbjs: this.master, names: this.formPropertyNames,
						control: control,
						controls: legacy.controls }
				),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit' }, _("Submit"))),
				ns.p({ class: 'button-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			), resolvent.legacyScript, legacy.legacy);
	})
});
