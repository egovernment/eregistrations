/** Renders form of a FormSectionUpdate object
 * @param document {object} - document object, usually DOM
 * @param options {object} -
 * {
 *  append {object} - domjs object to append after fieldset
 *  customize {function} - customization callback
 *  master {object} - by default section's master object
 *  prepend {object} - domjs object to prepend before fieldset
 *  url {string} - url used by the form (note: url is used to build action attribute for the form)
 * }
 * @returns {array} - array of constructed domjs elements
 */
'use strict';

var _                = require('mano').i18n.bind('Sections')
  , _d               = _
  , d                = require('d')
  , db               = require('mano').db
  , ns               = require('mano').domjs.ns
  , headersMap       = require('../utils/headers-map')
  , normalizeOptions = require('es5-ext/object/normalize-options');

require('./form-section-update-to-dom-fieldset');
require('./form-section-base');

module.exports = Object.defineProperty(db.FormSectionUpdate.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var options = normalizeOptions(arguments[1])
		  , url = options.url || ns.url
		  , actionUrl = url(this.actionUrl)
		  , master = options.master || this.master
		  , customizeData = { sourceSection: {}, master: master }
		  , headerRank = options.headerRank || 2
		  , contentContainer
		  , fieldsetResult
		  , drawAsTabular
		  , sectionFieldsetOptions = {
			fieldsetOptions: options.fieldsetOptions,
			prepend: options.prepend,
			append: options.append,
			master: master,
			formId: this.domId,
			subSectionHeaderRank: headerRank + 1,
			disableHeader: true
		};
		drawAsTabular = this.sourceSection.hasOnlyTabularChildren ||
			(db.FormEntitiesTable && this.sourceSection instanceof db.FormEntitiesTable);

		fieldsetResult = [
			this.originalSourceSection.toDOM(document, { disableHeader: true, displayEmptyFields: true,
				cssClass: ['form-section-update', 'entity-data-section'] }),
			mmap(this._resolventProperty, function () {
				return this.toDOMFieldset(document, sectionFieldsetOptions);
			}.bind(this))
		];
		contentContainer = [
			ns._if(this._label, [
				headersMap[headerRank](this._label),
				ns._if(this._legend, ns.div({ class: 'section-primary-legend' },
					ns.md(this._legend.map(function (legend) {
						if (!legend) return;
						return _d(legend, this.getTranslations());
					}.bind(this)))))]),
			fieldsetResult,
			drawAsTabular ? null :
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
				drawAsTabular ? contentContainer : customizeData.form = ns.form(
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
			customizeData.sourceSection = fieldsetResult.sourceSection;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
