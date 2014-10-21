'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , url;

url = ns.url;

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMForm: d(function (document, mainEntity) {
		var resolvent = this.getFormResolvent(mainEntity);
		return ns.section({ class: 'section-primary' },
			ns.form(
				{ id: resolvent.formId, action: url(this.actionUrl), class: ns._if(ns.eq(
					mainEntity.getObservable(this.statusResolventProperty),
					1
				), 'completed') },
				ns.h2(this.label),
				ns.hr(),
				resolvent.formResolvent,
				ns.fieldset(
					{ id: resolvent.affectedSectionId, class: 'form-elements',
						dbjs: mainEntity, names: this.propertyNames }
				),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit' }, _("Submit"))),
				ns.p({ class: 'button-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			), resolvent.radioMatch);
	})
});
