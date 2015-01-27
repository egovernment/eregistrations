'use strict';

var d        = require('d')
  , isNested = require('dbjs/is-dbjs-nested-object')
  , _if      = require('observable-value/if')
  , map      = require('observable-value/map')
  , resolve  = require('observable-value/resolve')
  , _  = require('mano').i18n.bind("Documents")

  , db       = require('mano').db
  , normRe = /[$#:\/]/g;

module.exports = Object.defineProperties(db.SubmissionFile, {
	inputOptions: d({
		render: function (options) {
			var el = this.make, label = options.label, dom, errorTxt, errorSpan;
			if (label == null) {
				if (options.dbOptions) label = options.dbOptions.label;
				if (label == null) label = db.SubmissionFile.uploadLabel;
				if (label == null) label = _("Select file");
			}

			dom = el('div', { class: 'file-uploader' },
				this.valueDOM = el(this.multiple ? 'ul' : 'div', { class: 'file-uploader-items' }),
				el('p', { class: 'file-uploader-button' },
					el('a',
						el('label', label,
							this.control = el('input', { type: 'file' })))),
				errorSpan = el('span', { class: 'error-message error-message-' +
					options.observable.dbId.replace(normRe, '-') }, ""));
			errorTxt = errorSpan.firstChild;
			this.control.addEventListener('invalid', function (e) {
				e.preventDefault();
				errorTxt.data = this.validationMessage;
			});
			this.control.addEventListener('change', function () {
				errorTxt.data = "";
			});
			return dom;
		},
		renderItem: function (file) {
			var el = this.make, data = {}, remove, itemDom;

			if (this.multiple) {
				data.dom = el('li', { 'data-id': file.__id__ });
			} else {
				data.dom = el('div', { 'data-id': file.__id__ });
			}

			remove = isNested(file)
				? file._destroy_.bind(file)
				: this.removeItem.bind(this, data.dom);

			itemDom = _if(file._name,
				el('div', { class: 'file-thumb' },
					el('a',
						{ href: file._url, target: '_blank', class: 'file-thumb-image' },
						el('img',
							{ src: resolve(file._thumb, '_url') }
							)
						),
					data.control =
						el('input',
							{ type: 'hidden', name: this.name, value: file.__id__ }
							),
					el('div', { class: 'file-thumb-actions' },
						el('span', { class: 'file-thumb-document-size' },
							map(file._diskSize, function (size) {
								if (size == null) return null;
								return ((size / 1000000).toFixed(2) + ' Mo');
							})
							),
						el('span',
							{ class: 'file-thumb-action', onclick: remove },
							el('span',
								{ class: 'fa fa-trash-o' }, "delete"
								)
							),
						el('a',
							{ href: file._url, target: '_blank', class: 'file-thumb-action' },
							el('span',
								{ class: 'fa fa-download' }, "download"
								)
							)
						)

					));
			data.dom.appendChild(itemDom.toDOM ? itemDom.toDOM(this.document) : itemDom);
			return data;
		}
	})
});
