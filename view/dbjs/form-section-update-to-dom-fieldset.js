/** Renders fieldset of a FormSectionUpdate object
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
  , _                = require('mano').i18n.bind('View: Binding: Sections')
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
		  , drawAsTabular
		  , customizeData        = { master: master }
		  , subSectionHeaderRank = options.subSectionHeaderRank || 3
		  , fieldsetOptions      = {
			fieldsetOptions: options.fieldsetOptions,
			master: master,
			formId: options.formId,
			disablePartialSubmit: options.disablePartialSubmit != null ? options.disablePartialSubmit
					: this.disablePartialSubmit
		};
		drawAsTabular = this.sourceSection.hasOnlyTabularChildren ||
			(db.FormEntitiesTable && this.sourceSection instanceof db.FormEntitiesTable);

		customizeData.arrayResult = [
			options.prepend,
			drawAsTabular ? (resolvent.formResolvent ? ns.form({
				action: options.actionUrl,
				class: 'form-elements form-section-update-question',
				autoSubmit: true,
				method: 'post'
			}, resolvent.formResolvent, ns.p({ class: 'submit' },
				ns.input({ type: 'submit', value: _("Submit") }))) : undefined) :
					div({ class: 'form-elements form-section-update-question' },
						resolvent.formResolvent),
			progressRules(this)
		];

		customizeData.sourceSection = customizeData.arrayResult.sourceSection = {};
		customizeData.sourceSection.object = this.sourceSection;
		customizeData.arrayResult.push(
			ns._if(ns.or(!drawAsTabular, eq(this._resolvent, this._resolventValue)),
				ns.div({ id: resolvent.affectedSectionId },
					ns.div({ class: 'section-primary-sub', id: this.sourceSection.domId },
						options.disableHeader ? null :
								[ns._if(this.sourceSection._label,
									headersMap[subSectionHeaderRank](this.sourceSection.label)),
									ns._if(this.sourceSection._legend, ns.div({ class: 'section-primary-legend' },
										ns.md(this.sourceSection._legend)))],
						customizeData.sourceSection.arrayResult
							= this.sourceSection.toDOMFieldset(document, fieldsetOptions)
						), resolvent.legacyScript).extend(options.append))
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
