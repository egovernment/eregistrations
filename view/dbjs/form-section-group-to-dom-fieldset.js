/** Renders fieldset of a FormSectionGroup object
 * @param document {object} - document object, usually DOM
 * @param options {object} -
 * {
 *  append {object} - domjs object to append
 *  customize {function} - customization callback
 *  formId {string} - the id of the parent form
 *  master {object} - by default section's master object
 *  prepend {object} - domjs object to prepend
 * }
 * @returns {array} - array of constructed domjs elements
 */
'use strict';

var d                = require('d')
  , db               = require('mano').db
  , _                = require('mano').i18n.bind('View: Binding: Sections')
  , ns               = require('mano').domjs.ns
  , find             = require('es5-ext/array/#/find')
  , forEach          = require('es5-ext/object/for-each')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , progressRules    = require('../components/progress-rules')
  , headersMap       = require('../utils/headers-map');

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSectionGroup.prototype, {
	toDOMFieldset: d(function (document/*, options */) {
		var options              = normalizeOptions(arguments[1])
		  , master               = options.master || this.master
		  , resolvent            = this.getFormResolvent(options)
		  , customizeData        = { master: master }
		  , subSectionHeaderRank = options.subSectionHeaderRank || 3
		  , fieldsetOptions      = {
			fieldsetOptions: options.fieldsetOptions,
			master: master,
			formId: options.formId,
			disablePartialSubmit: options.disablePartialSubmit != null ? options.disablePartialSubmit
				: this.disablePartialSubmit
		};

		customizeData.arrayResult = [
			options.prepend,
			this.hasOnlyTabularChildren ? (resolvent.formResolvent ? ns.form({
				action: options.actionUrl,
				class: 'form-elements',
				autoSubmit: true,
				method: 'post'
			}, resolvent.formResolvent, ns.p({ class: 'submit' },
				ns.input({ type: 'submit', value: _("Submit") }))) : undefined) :
					div({ class: 'form-elements' }, resolvent.formResolvent),
			progressRules(this)
		];

		customizeData.subSections = customizeData.arrayResult.subSections = {};
		var drawCondition;
		if (this.resolventProperty && this.hasOnlyTabularChildren) {
			drawCondition = not(this._isUnresolved);
		} else {
			drawCondition = true;
		}

		customizeData.arrayResult.push(
			ns._if(drawCondition,
				ns.div({ id: resolvent.affectedSectionId }, ns.list(this.applicableSections,
					function (subSection, subSectionName) {
						customizeData.subSections[subSectionName] = {};
						customizeData.subSections[subSectionName].object = subSection;
						return ns.div(
							{ class: 'section-primary-sub', id: subSection.domId },
							ns._if(subSection.label, headersMap[subSectionHeaderRank](subSection.label)),
							ns._if(subSection._legend, ns.div({ class: 'section-primary-legend' },
								ns.md(subSection._legend))),
							customizeData.subSections[subSectionName].arrayResult
								= subSection.toDOMFieldset(document, fieldsetOptions)
						);
					}, this), resolvent.legacyScript).extend(options.append)
				)
		);

		if (typeof options.customize === 'function') {
			forEach(customizeData.subSections, function (subSection) {
				var fieldset;
				fieldset = find.call(subSection.arrayResult, function (el) {
					return el && el.nodeName === 'FIELDSET';
				});
				// there may not be any fieldsets (i.e only tabular children)
				if (fieldset) {
					subSection.fieldset = fieldset._dbjsFieldset;
				}
				// In case of tabular children
				subSection.arrayResult.some(function (el) {
					if (el && el.querySelector && el.querySelector('.buttons-container')) {
						subSection.buttonsContainer = el.querySelector('.buttons-container');
						return true;
					}
				});
			});
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
