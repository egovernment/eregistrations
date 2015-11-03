/** Renders form of a FormSectionGroup object
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
  , ns = require('mano').domjs.ns
  , find = require('es5-ext/array/#/find')
  , forEach = require('es5-ext/object/for-each');

require('./form-section-to-dom-fieldset');
require('./form-section-base');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var mainFormResolvent, actionUrl, options = Object(arguments[1]), url
		  , customizeData, master = options.master || this.master, fieldsetOptions;
		customizeData = { subSections: {}, master: master };
		mainFormResolvent = this.getFormResolvent(options);
		url = options.url || ns.url;
		actionUrl = url(this.actionUrl);
		if (options.isChildEntity) {
			actionUrl = master.constructor.prototype === master ?
					url(this.actionUrl + '-add') :
					url(this.actionUrl, master.__id__);
		}
		fieldsetOptions = {
			master: master,
			formId: this.domId
		};
		customizeData.arrayResult = [customizeData.container = ns.section(
			{ class: 'section-primary' },
			customizeData.form = ns.form({ id: this.domId, method: 'post',
					action: actionUrl,
					class: ns._if(ns.eq(
					this._status,
					1
				), 'completed form-elements', 'form-elements')
				},
				ns._if(this._label,
					[ns.h2(this._label), ns.hr(),
						ns._if(this._legend, ns.div({ class: 'section-primary-legend' },
							ns.md(this._legend)))]),
				options.prepend,
				mainFormResolvent.formResolvent,
				ns.div({ id: mainFormResolvent.affectedSectionId }, ns.list(this.sections,
					function (subSection, subSectionName) {
						customizeData.subSections[subSectionName] = {};
						return ns.div({ class: 'section-primary-sub', id: subSection.domId },
							ns._if(subSection.label, ns.h3(subSection.label)),
							customizeData.subSections[subSectionName].arrayResult =
								subSection.toDOMFieldset(document, fieldsetOptions));
					}, this)).extend(options.append),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit', value: _("Submit") })),
				ns.p(
					{ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, "Back to top"))
				)
				)
		), mainFormResolvent.legacyScript];

		if (typeof options.customize === 'function') {
			forEach(customizeData.subSections, function (subSection) {
				subSection.fieldset = find.call(subSection.arrayResult, function (el) {
					return el && el.nodeName === 'FIELDSET';
				})._dbjsFieldset;
			});
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
