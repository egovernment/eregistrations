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
  , ns               = require('mano').domjs.ns
  , find             = require('es5-ext/array/#/find')
  , forEach          = require('es5-ext/object/for-each')
  , progressRules    = require('../components/progress-rules')
  , normalizeOptions = require('es5-ext/object/normalize-options');

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSectionGroup.prototype, {
	toDOMFieldset: d(function (document/*, options */) {
		var options         = normalizeOptions(arguments[1])
		  , master          = options.master || this.master
		  , resolvent       = this.getFormResolvent(options)
		  , customizeData   = { master: master }
		  , fieldsetOptions = {
			master: master,
			formId: options.formId
		};

		customizeData.arrayResult = [
			options.prepend,
			resolvent.formResolvent,
			progressRules(this, { translationInserts: options.translationInserts })
		];

		customizeData.subSections = customizeData.arrayResult.subSections = {};

		customizeData.arrayResult.push(
			ns.div({ id: resolvent.affectedSectionId }, ns.list(this.sections,
				function (subSection, subSectionName) {
					customizeData.subSections[subSectionName] = {};
					customizeData.subSections[subSectionName].object = subSection;
					return ns.div(
						{ class: 'section-primary-sub', id: subSection.domId },
						ns._if(subSection.label, ns.h3(subSection.label)),
						ns._if(subSection._legend, ns.div({ class: 'section-primary-legend' },
							ns.md(subSection._legend))),
						customizeData.subSections[subSectionName].arrayResult
							= subSection.toDOMFieldset(document, fieldsetOptions)
					);
				}, this), resolvent.legacyScript).extend(options.append)
		);

		if (typeof options.customize === 'function') {
			forEach(customizeData.subSections, function (subSection) {
				subSection.fieldset = find.call(subSection.arrayResult, function (el) {
					return el && el.nodeName === 'FIELDSET';
				})._dbjsFieldset;
			});
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
