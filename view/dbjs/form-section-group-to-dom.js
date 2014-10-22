'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , url;

url = ns.url;

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOMForm',
	d(function (document, mainEntity) {
		var mainFormResolvent = this.getFormResolvent(mainEntity);
		ns.section(
			{ class: 'section-primary' },
			ns.form({ id: mainFormResolvent.formId, action: url(this.actionUrl), class: ns._if(ns.eq(
				mainEntity.getObservable(this.statusResolventProperty),
				1
			), 'completed')
				},
				ns.h2(this.label),
				ns.hr(),
				mainFormResolvent.formResolvent,
				ns.div({ id: mainFormResolvent.affectedSectionId }, ns.list(this.sections,
					function (subSection) {
						var formResolvent = subSection.getFormResolvent(mainEntity,
							{ formId: mainFormResolvent.formId });
						return ns.div({ class: 'sub-section' },
							ns.h3(subSection.label),
							formResolvent.formResolvent,
							ns.fieldset(
								{ id: formResolvent.affectedSectionId, class: 'form-elements',
									dbjs: mainEntity, names: subSection.propertyNames }
							), formResolvent.radioMatch);
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
