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

var _       = require('mano').i18n.bind('Sections')
  , d       = require('d')
  , forEach = require('es5-ext/object/for-each')
  , db      = require('mano').db
  , ns      = require('mano').domjs.ns
  , hasOnlyTabularChildren;

require('./form-section-group-to-dom-fieldset');
require('./form-section-base');

hasOnlyTabularChildren = function (subSections) {
	var res = false, hasOtherChildren = false;
	if (!db.FormEntitiesTable) return false;
	forEach(subSections, function (result) {
		if (result.object instanceof db.FormEntitiesTable) {
			res = true;
		} else {
			hasOtherChildren = true;
		}
		if (res && hasOtherChildren) {
			throw new Error("You cannot mix tabular and non tabular sections in a group section!");
		}
	});

	return res;
};

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var options         = Object(arguments[1])
		  , url             = options.url || ns.url
		  , actionUrl       = url(this.actionUrl)
		  , master          = options.master || this.master
		  , customizeData   = { subSections: {}, master: master }
		  , contentContainer
		  , fieldsetResult
		  , sectionFieldsetOptions = {
			prepend: options.prepend,
			append: options.append,
			master: master,
			formId: this.domId
		};

		if (options.isChildEntity) {
			actionUrl = master.constructor.prototype === master ?
					url(this.actionUrl + '-add') :
					url(this.actionUrl, master.__id__);
		}

		fieldsetResult = this.toDOMFieldset(document, sectionFieldsetOptions);
		contentContainer = [
			ns._if(this._label, [
				ns.h2(this._label),
				ns.hr(),
				ns._if(this._legend, ns.div({ class: 'section-primary-legend' },
					ns.md(this._legend)))]),
			fieldsetResult,
			hasOnlyTabularChildren(fieldsetResult.subSections) ? null :
					ns.p({ class: 'submit-placeholder input' },
						ns.input({ type: 'submit', value: _("Submit") })),
			ns.p({ class: 'section-primary-scroll-top' },
				ns.a({ onclick: 'window.scroll(0, 0)' },
					ns.span({ class: 'fa fa-arrow-up' }, "Back to top")))
		];

		customizeData.arrayResult = [customizeData.container = ns.section(
			{ class: 'section-primary' },
			hasOnlyTabularChildren(fieldsetResult.subSections) ?
					contentContainer : customizeData.form = ns.form(
				{
					id: this.domId,
					method: 'post',
					action: actionUrl,
					class: ns._if(ns.eq(
						this._status,
						1
					), 'completed form-elements', 'form-elements')
				},
				contentContainer
			)
		)];

		if (typeof options.customize === 'function') {
			customizeData.subSections = fieldsetResult.subSections;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
