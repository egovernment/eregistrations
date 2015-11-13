"use strict";

var db            = require('mano').db
  , _             = require('mano').i18n.bind('View: Requirement Upload')
  , identity      = require('es5-ext/function/identity')
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , d             = require('d')
  , _d            = _;

/**
 * @param {object} document
 * @param {object=} options
 * - options.afterHeader {function} dom to be injected after header
 * @return {object}
 */

module.exports = Object.defineProperty(db.RequirementUpload.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var options = Object(arguments[1]);

		return form({ action: '/requirement-upload/' +
				camelToHyphen.call(this.document.uniqueKey) + '/', method: 'post',
				enctype: 'multipart/form-data', autoSubmit: true },

			h2(this.document._label.map(function (label) {
				return _d(label, { user: this.master });
			}.bind(this))),
			_if(this._isRecentlyRejected, div({ class: 'info-main' },
					_if(eq(this.rejectReasons._size, 1),
							p(this.rejectReasons._first),
							ul(this.rejectReasons, identity)))),
			typeof options.afterHeader === 'function' ? options.afterHeader(this) : null,
			hr(),
			this.document.legend &&
				p({ class: 'section-primary-legend' }, mdi(_d(this.document.legend,
					{ user: this.master }))),
			input({ dbjs: this.document.files._map, label: _("Select file") }),
			p({ class: 'submit' }, input({ type: 'submit', value: _("Submit") })),
			p({ class: 'section-primary-scroll-top' },
					a({ onclick: 'window.scroll(0, 0)' },
						span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			);
	}));
