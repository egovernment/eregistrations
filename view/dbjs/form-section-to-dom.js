/** Renders form of a FormSection object
 * @param document {object} - document object, usually DOM
 * @param options {object} -
 * {
 *  append {object} - domjs object to append after fieldset
 *  customize {function} - customization callback
 *  isChildEntity {boolean} - used to handle addition of child objects
 *  master {object} - by default section's master object
 *  prepend {object} - domjs object to prepend before fieldset
 *  url {string} - url used by the form (note: url is used to build action attribute for the form)
 * }
 * @returns {array} - array of constructed domjs elements
 */
'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , find = require('es5-ext/array/#/find')
  , ns = require('mano').domjs.ns;

require('./form-section-to-dom-fieldset');
require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMForm: d(function (document/*, options */) {
		var actionUrl, options = Object(arguments[1]), url, customizeData
		  , master = options.master || this.master, fieldsetOptions, fieldsetResult;
		customizeData = { master: master };
		fieldsetOptions = {
			prepend: options.prepend,
			append: options.append,
			master: master,
			formId: this.domId
		};
		url = options.url || ns.url;
		actionUrl = url(this.actionUrl);
		if (options.isChildEntity) {
			actionUrl = (master.constructor.prototype === master) ?
					url(this.actionUrl + '-add') :
					url(this.actionUrl, master.__id__);
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
					[ns.h2(this._label), ns._if(this._legend, ns.p(this._legend)),
						ns.hr()]),
				fieldsetResult = this.toDOMFieldset(document, fieldsetOptions),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit', value: _("Submit") })),
				ns.p({ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			))];
		if (typeof options.customize === 'function') {
			customizeData.fieldset = find.call(fieldsetResult, function (el) {
				return el && el.nodeName === 'FIELDSET';
			})._dbjsFieldset;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
