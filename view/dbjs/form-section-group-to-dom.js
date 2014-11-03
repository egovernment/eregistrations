'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , url;

require('./form-section-base-get-resolvent');
require('./form-section-base-get-legacy');

url = ns.url;

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOMForm',
	d(function (document) {
		var mainFormResolvent, actionUrl;
		mainFormResolvent = this.getFormResolvent();
		actionUrl = url(this.actionUrl);
		if (this.buildActionUrl) {
			actionUrl = this.master.constructor.prototype === this.master ?
					url(this.constructor.actionUrl + '-add') :
					url(this.constructor.actionUrl, this.master.__id__);
		}
		return ns.section(
			{ class: 'section-primary' },
			ns.form({ id: mainFormResolvent.formId, method: 'post',
					action: actionUrl,
					class: ns._if(ns.eq(
					this.status,
					1
				), 'completed')
				},
				ns.h2(this.constructor.label),
				ns.hr(),
				mainFormResolvent.formResolvent,
				ns.div({ id: mainFormResolvent.affectedSectionId }, ns.list(this.sections,
					function (subSection) {
						var formResolvent, legacy;
						formResolvent = subSection.getFormResolvent({ formId: mainFormResolvent.formId });
						legacy = subSection.getLegacy(mainFormResolvent.formId);
						return ns.div({ class: 'sub-section' },
							ns.h3(subSection.constructor.label),
							formResolvent.formResolvent,
							ns.fieldset(
								{ id: formResolvent.affectedSectionId, class: 'form-elements',
									dbjs: subSection.master, names: subSection.formPropertyNames,
									controls: legacy.controls }
							), formResolvent.radioMatch, legacy.legacy);
					})),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit' }, _("Submit"))),
				ns.p(
					{ class: 'button-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, "Back to top"))
				)
				),
			mainFormResolvent.radioMatch
		);
	}));
