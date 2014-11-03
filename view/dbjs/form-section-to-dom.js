'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , url;

require('./form-section-base-get-resolvent');
require('./form-section-base-get-legacy');

url = ns.url;

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMForm: d(function (document) {
		var resolvent, legacy, actionUrl;
		resolvent = this.getFormResolvent();
		legacy = this.getLegacy(resolvent.formId);
		actionUrl = url(this.actionUrl);
		if (this.buildActionUrl) {
			actionUrl = this.master.constructor.prototype === this.master ?
					url(this.constructor.actionUrl + '-add') :
					url(this.constructor.actionUrl, this.master.__id__);
		}
		return ns.section({ class: 'section-primary' },
			ns.form(
				{ id: resolvent.formId,
					method: 'post',
					action: actionUrl, class: ns._if(ns.eq(
					this.status,
					1
				), 'completed') },
				ns.h2(this.constructor.label),
				ns.hr(),
				resolvent.formResolvent,
				ns.fieldset(
					{ id: resolvent.affectedSectionId, class: 'form-elements',
						dbjs: this.master, names: this.formPropertyNames,
						controls: legacy.controls }
				),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit' }, _("Submit"))),
				ns.p({ class: 'button-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			), resolvent.radioMatch, legacy.legacy);
	})
});
