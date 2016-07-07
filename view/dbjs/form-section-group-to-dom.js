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

var _          = require('mano').i18n.bind('View: Binding: Sections')
  , _d         = _
  , d          = require('d')
  , db         = require('mano').db
  , ns         = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map');

require('./form-section-group-to-dom-fieldset');
require('./form-section-base');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var options         = Object(arguments[1])
		  , url             = options.url || ns.url
		  , actionUrl       = url(this.actionUrl)
		  , master          = options.master || this.master
		  , customizeData   = { subSections: {}, master: master }
		  , headerRank      = options.headerRank || 2
		  , contentContainer
		  , fieldsetResult
		  , sectionFieldsetOptions = {
			fieldsetOptions: options.fieldsetOptions,
			prepend: options.prepend,
			append: options.append,
			master: master,
			formId: this.domId,
			actionUrl: null,
			subSectionHeaderRank: headerRank + 1
		};

		if (options.isChildEntity) {
			actionUrl = master.constructor.prototype === master ?
					url(this.actionUrl + '-add') :
					url(this.actionUrl, master.__id__);
		}
		sectionFieldsetOptions.actionUrl = actionUrl;

		fieldsetResult = this.toDOMFieldset(document, sectionFieldsetOptions);
		contentContainer = [
			ns._if(this._label, [
				headersMap[headerRank](this._label),
				ns._if(this._legend, ns.div({ class: 'section-primary-legend' },
					ns.md(this._legend.map(function (legend) {
						if (!legend) return;
						return _d(legend, this.getTranslations());
					}.bind(this)))))]),
			fieldsetResult,
			this.hasOnlyTabularChildren ? null :
					ns.p({ class: 'submit-placeholder input' },
						ns.input({ type: 'submit', value: _("Submit") })),
			ns.p({ class: 'section-primary-scroll-top' },
				ns.a({ onclick: 'window.scroll(0, 0)' },
					ns.span({ class: 'fa fa-arrow-up' }, "Back to top")))
		];

		customizeData.arrayResult = [customizeData.container = ns.section(
			{ class: options.cssSectionClass === false ?
					null : options.cssSectionClass || 'section-primary' },
			_if(this._isDisabled, div({ class: 'entities-overview-info' }, this._disabledMessage)),
			div({ class: ['disabler-range',
					_if(this._isDisabled, 'disabler-active')] },
				div({ class: 'disabler' }),
				this.hasOnlyTabularChildren ?
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
				))
		)];

		if (typeof options.customize === 'function') {
			customizeData.subSections = fieldsetResult.subSections;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
