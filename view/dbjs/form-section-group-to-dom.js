'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

require('./form-section-base');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var mainFormResolvent, actionUrl, options, url;
		mainFormResolvent = this.getFormResolvent();
		options = Object(arguments[1]);
		url = options.url || ns.url;
		actionUrl = url(this.constructor.actionUrl);
		if (options.isChildEntity) {
			actionUrl = this.master.constructor.prototype === this.master ?
					url(this.constructor.actionUrl + '-add') :
					url(this.constructor.actionUrl, this.master.__id__);
		}
		return ns.section(
			{ class: 'section-primary' },
			ns.form({ id: this.domId, method: 'post',
					action: actionUrl,
					class: ns._if(ns.eq(
					this.status,
					1
				), 'completed')
				},
				ns._if(this.constructor.label,
					[ns.h2(this.constructor.label),
						ns.hr()]),
				mainFormResolvent.formResolvent,
				ns.div({ id: mainFormResolvent.affectedSectionId }, ns.list(this.sections,
					function (subSection) {
						var formResolvent, legacy, control;
						formResolvent = subSection.getFormResolvent();
						legacy = subSection.getLegacy(this.domId, options);
						if (!subSection.forceRequiredInput) {
							control = { required: subSection.forceRequiredInput };
						}
						return ns.div({ class: 'sub-section', id: subSection.domId },
							ns._if(subSection.constructor.label, ns.h3(subSection.constructor.label)),
							formResolvent.formResolvent,
							ns.fieldset(
								{ id: formResolvent.affectedSectionId, class: 'form-elements',
									dbjs: subSection.master, names: subSection.formPropertyNames,

									control: control,
									controls: legacy.controls }
							), formResolvent.legacyScript, legacy.legacy);
					}, this)),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit' }, _("Submit"))),
				ns.p(
					{ class: 'button-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, "Back to top"))
				)
				),
			mainFormResolvent.legacyScript
		);
	}));
