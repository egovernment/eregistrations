'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , url;

url = ns.url;

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOM',
	d(function (document, mainEntity) {
		ns.section(
			{ class: 'section-primary' },
			ns.form({ action: url(this.actionUrl), class: ns._if(ns.eq(
				mainEntity.getObservable(this.statusResolventProperty),
				1
			), 'completed')
				},
				ns.h2(this.label),
				ns.hr(),
				ns.list(this.sections, function (subSection) {
					return ns.div({ class: 'sub-section' },
						ns.h3(subSection.label),
						ns.fieldset(
							{ class: 'form-elements', dbjs: mainEntity, names: subSection.propertyNames }
						));
				}),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit' }, _("Submit"))),
				ns.p(
					{ class: 'button-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, "Back to top"))
				)
				)
		);
	}));
