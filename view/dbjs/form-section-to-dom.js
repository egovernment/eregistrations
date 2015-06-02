'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

require('./form-section-to-dom-fieldset');
require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMForm: d(function (document/*, options */) {
		var actionUrl, options = Object(arguments[1]), url, customizeData
		  , master = options.master || this.master, fieldsetOptions, fieldsetResult;
		customizeData = {};
		fieldsetOptions = {
			prepend: options.prepend,
			append: options.append,
			master: master,
			formId: this.domId
		};
		url = options.url || ns.url;
		actionUrl = url(this.constructor.actionUrl);
		if (options.isChildEntity) {
			actionUrl = (master.constructor.prototype === master) ?
					url(this.constructor.actionUrl + '-add') :
					url(this.constructor.actionUrl, master.__id__);
		}
		customizeData.arrayResult = [customizeData.container = ns.section({ class: 'section-primary' },
			customizeData.form = ns.form(
				{ id: this.domId,
					method: 'post',
					action: actionUrl, class: ns._if(ns.eq(
					this._status,
					1
				), 'completed form-elements', 'form-elements') },
				ns._if(this._label,
					[ns.h2(this._label),
						ns.hr()]),
				fieldsetResult = this.toDOMFieldset(document, fieldsetOptions),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit', value: _("Submit") })),
				ns.p({ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			))];
		if (typeof options.customize === 'function') {
			customizeData.fieldset = fieldsetResult[2].fieldset._dbjsFieldset;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
