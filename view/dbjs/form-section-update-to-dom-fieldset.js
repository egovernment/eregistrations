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
  , progressRules    = require('../components/progress-rules')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , headersMap       = require('../utils/headers-map');

require('./form-section-base');

module.exports = Object.defineProperties(db.FormSectionUpdate.prototype, {
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
			resolvent.formResolvent,
			progressRules(this)
		];

		customizeData.sourceSection = customizeData.arrayResult.sourceSection = {};
		customizeData.sourceSection.object = this.sourceSection;

		customizeData.arrayResult.push(
			ns.div({ id: resolvent.affectedSectionId },
				ns.div(
					{ class: 'section-primary-sub', id: this.sourceSection.domId },
					ns._if(this.sourceSection._label,
						headersMap[subSectionHeaderRank](this.sourceSection.label)),
					ns._if(this.sourceSection._legend, ns.div({ class: 'section-primary-legend' },
						ns.md(this.sourceSection._legend))),
					customizeData.sourceSection.arrayResult
						= this.sourceSection.toDOMFieldset(document, fieldsetOptions)
				), resolvent.legacyScript).extend(options.append)
		);

		if (typeof options.customize === 'function') {
			customizeData.sourceSection.fieldset = find.call(customizeData.sourceSection.arrayResult,
				function (el) {
					return el && el.nodeName === 'FIELDSET';
				})._dbjsFieldset;
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	})
});
