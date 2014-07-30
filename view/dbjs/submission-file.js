'use strict';

var d        = require('d')
  , isNested = require('dbjs/is-dbjs-nested-object')
  , _if      = require('observable-value/if')
  , map      = require('observable-value/map')
  , resolve  = require('observable-value/resolve')

  , db       = require('mano').db
  , normRe = /[$#:\/]/g;

module.exports = Object.defineProperties(db.SubmissionFile, {
	inputOptions: d({
		render: function (options) {
			var el = this.make, label = options.label, dom, errorTxt, errorSpan;
			if (label == null) {
				if (options.dbOptions) label = options.dbOptions.label;
				if (label == null) label = db.SubmissionFile.uploadLabel;
				if (label == null) label = "Select file";
			}
			dom = el('div', this.valueDOM = el('ul', { class: 'documents' }),
				el('div', { class: 'btn-upload' },
					el('label', label,
						this.control = el('input', { type: 'file' }))),
				errorSpan = el('span', { class: 'error-message-' +
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

			data.dom = el('li', { 'data-id': file.__id__ });

			remove = isNested(file)
				? file._clear_.bind(file)
				: this.removeItem.bind(this, data.dom);

			itemDom = _if(file._name,
				el('div',
					el('a',
						{ href: file._url, target: '_blank', class: 'thumb-doc' },
						el('img',
							{ src: resolve(file._thumb, '_url') }
							)
						),
					data.control =
						el('input',
							{ type: 'hidden', name: this.name, value: file.__id__ }
							),
					el('div',
						el('span', { class: 'document-size' },
							map(file._diskSize, function (size) {
								if (size == null) return null;
								return ((size / 1000000).toFixed(2) + ' Mo');
							})
							),
						el('a',
							{ class: 'doc-action', onclick: remove },
							el('i',
								{ class: 'fa fa-download fa-lg' }
								)
							),
						el('a',
							{ href: file._url, target: '_blank', class: 'doc-action' },
							el('i',
								{ class: 'fa fa-trash-o fa-lg' }
								)
							)
						)

					));
			data.dom.appendChild(itemDom.toDOM ? itemDom.toDOM(this.document) : itemDom);
			return data;
		}
	})
});
