"use strict";

var db = require('mano').db
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , _  = require('mano').i18n.bind('View: Requirement Upload')
  , _d = _
  , d = require('d');

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
			div(
				h2(_d(this.document.label, { user: this.master })),
				this.document.legend &&
					small(mdi(_d(this.document.legend,
						{ user: this.master }))),
				typeof options.afterHeader === 'function' ? options.afterHeader(this) : null,
				hr(),
				input({ dbjs: this.document.files._map, label: true }),
				p({ class: 'submit' }, input({ type: 'submit', value: _("Submit") })),
				p({ class: 'section-primary-scroll-top' },
						a({ onclick: 'window.scroll(0, 0)' },
							span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
			));
	}));
