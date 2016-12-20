/** Renders table of a FormEntitiesTable object
 * @param document {object} - document object, usually DOM
 * @param options {object} -
 * {
 *  addButtonLabel {string} - default "Add new"
 *  append {object} - domjs object to append after table
 *  customize {function} - customization callback
 *  master {object} - by default section's master object
 *  prepend {object} - domjs object to prepend before table
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

require('./form-entities-table-to-dom-fieldset');
require('./form-section-base');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var options       = Object(arguments[1])
		  , headerRank    = options.headerRank || 2
		  , customizeData = { master: options.master || this.master };

		customizeData.arrayResult = [customizeData.container = ns.section(
			{ id: this.domId, class: ns._if(ns.eq(
				this._status,
				1
			), 'section-primary completed entities-overview', 'section-primary entities-overview') },

			_if(this._isDisabled, div({ class: 'entities-overview-info' }, this._disabledMessage)),
			div({ class: ['disabler-range',
					_if(this._isDisabled, 'disabler-active')] },
				div({ class: 'disabler' }),
				ns._if(this._label, [
					headersMap[headerRank](this._label),
					ns._if(this._legend,
						ns.div({ class: 'section-primary-legend' },
							ns.md(this._legend.map(function (legend) {
								if (!legend) return;
								return _d(legend, this.getTranslations());
							}.bind(this)))))]),
				this.toDOMFieldset(document, options),
				ns.p({ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' }, ns.span({ class: 'fa fa-arrow-up' },
						_("Back to top")))))
		)];
		if (typeof options.customize === 'function') {
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
