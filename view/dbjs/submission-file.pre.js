// Temporary, to be used until prototype is used as base for all systems

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
			var el = this.make, data = {}, itemDom, name;

			data.dom = el('li', { class: _if(file._name, null, 'empty'), 'data-id': file.__id__ });

			if (isNested(file)) name = file.__id__;
			else if (this.multiple) name = this.observable.dbId + '*7' + file.__id__;
			else name = this.observable.dbId;

			itemDom = _if(file._name, el('span',
				el('a', { href: file._url, target: '_blank', class: 'thumb-doc' },
					el('img', { src: resolve(file._thumb, '_url') })),
				el('span', { class: 'thumb-doc-action' },
					map(file._diskSize, function (size) {
						if (size == null) return null;
						return ((size / 1000000).toFixed(2) + ' Mo');
					})),
				el('label', { class: 'thumb-doc-action' },
					el('input', { type: 'checkbox', name: name, value: '' }),
					el('i', { class: 'icon-trash' })),
				el('a', { href: file._url, target: '_blank',
					class: 'dlBtn thumb-doc-action' },
					el('i', { class: 'icon-arrow-down' }))));
			data.dom.appendChild(itemDom.toDOM ? itemDom.toDOM(this.document) : itemDom);
			return data;
		}
	})
});
