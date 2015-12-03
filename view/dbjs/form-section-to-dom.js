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

var _    = require('mano').i18n.bind('Sections')
  , d    = require('d')
  , db   = require('mano').db
  , find = require('es5-ext/array/#/find')
  , ns   = require('mano').domjs.ns;

require('./form-section-to-dom-fieldset');
require('./form-section-base');

module.exports = Object.defineProperties(db.FormSection.prototype, {
	toDOMForm: d(function (document/*, options */) {
		var options                = Object(arguments[1])
		  , url                    = options.url || ns.url
		  , actionUrl              = url(this.actionUrl)
		  , master                 = options.master || this.master
		  , customizeData          = { master: master }
		  , fieldsetResult
		  , sectionFieldsetOptions = {
			prepend: options.prepend,
			append: options.append,
			master: master,
			formId: this.domId,
			fieldsetOptions: options.fieldsetOptions,
			viewContext: options.viewContext
		};

		if (options.isChildEntity) {
			actionUrl = (master.constructor.prototype === master) ?
					url(this.actionUrl + '-add') :
					url(this.actionUrl, master.__id__);
		}

		customizeData.arrayResult = [
			customizeData.container = ns.section(
				{ class: options.cssSectionClass || 'section-primary' },
				_if(this._isDisabled, div({ class: 'entities-overview-info' }, this._disabledMessage)),
				div({ class: ['disabler-range',
						_if(this._isDisabled, 'disabler-active')] },
					customizeData.form = ns.form(
						{
							id: this.domId,
							method: 'post',
							action: actionUrl,
							class: ns._if(ns.eq(
								this._status,
								1
							), 'completed form-elements', 'form-elements')
						},
						ns._if(this._label, [
							options.htmlHeader ? options.htmlHeader(this._label) : ns.h2(this._label),
							ns.hr(),
							ns._if(this._legend, ns.div({ class: 'section-primary-legend' },
								ns.md(this._legend)))]),
						fieldsetResult = this.toDOMFieldset(document, sectionFieldsetOptions),
						ns.p({ class: 'submit-placeholder input' },
							ns.input({ type: 'submit', value: _("Submit") })),
						ns.p({ class: 'section-primary-scroll-top' },
							ns.a({ onclick: 'window.scroll(0, 0)' },
								ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
					),
					div({ class: 'disabler' }))
			)];
		if (typeof options.customize === 'function') {
			customizeData.fieldset = find.call(fieldsetResult, function (el) {
				return el && el.nodeName === 'FIELDSET';
			})._dbjsFieldset;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
