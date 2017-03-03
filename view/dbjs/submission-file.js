'use strict';

var d            = require('d')
  , isNested     = require('dbjs/is-dbjs-nested-object')
  , _if          = require('observable-value/if')
  , map          = require('observable-value/map')
  , _            = require('mano').i18n.bind("View: Binding: File")
  , db           = require('mano').db
  , includes     = require('es5-ext/array/#/contains')
  , docMimeTypes = require('../../utils/microsoft-word-doc-mime-types')
  , xlsMimeTypes = require('../../utils/microsoft-excel-spreadsheet-mime-types')

  , normRe = /[$#:\/]/g;

module.exports = Object.defineProperties(db.File, {
	inputOptions: d({
		render: function (options) {
			var el = this.make, label = options.label, content;
			this.control = el('input', { type: 'file' });
			if (label == null) {
				content = this.control;
			} else {
				if (label === true) {
					if (options.dbOptions) label = options.dbOptions.label;
					if (label == null) label = db.File.uploadLabel;
					if (label == null) label = _("Select file");
				}
				content = el('label', label, this.control);
			}

			return el('div', { class: 'file-uploader' },
				this.valueDOM = el(this.multiple ? 'ul' : 'div', { class: 'file-uploader-items' }),
				el('p', { class: 'file-uploader-button' }, content),
				el('span', { class: 'error-message error-message-' +
					options.observable.dbId.replace(normRe, '-') }, ""));
		},
		renderItem: function (file) {
			var el = this.make, data = {}, itemDom, name, isValid = or(file._name, file._path), loader
			  , loaderText, fileThumb;

			if (this.multiple) {
				data.dom = el('li', { class: _if(isValid, null, 'empty'), 'data-id': file.__id__ });
			} else {
				data.dom = el('div', { class: _if(isValid, null, 'empty'), 'data-id': file.__id__ });
			}
			if (isNested(file)) name = file.__id__;
			else if (this.multiple) name = this.observable.dbId + '*7' + file.__id__;
			else name = this.observable.dbId;
			loader = div({ class: 'file-thumb-upload-status' },
				div({ class: 'throbber' },
					div({ class: 'spinner-loader' })),
				loaderText = text(''));
			file.on('upload-progress', function (ev) {
				var loadedPercent;
				if (!ev.total) return;
				loadedPercent = (ev.loaded / ev.total);
				fileThumb.classList.add('file-thumb-uploading');
				if (loadedPercent === 1) {
					loaderText.data = _("Generating preview");
					fileThumb.classList.remove('file-thumb-uploading');
					fileThumb.classList.add('file-thumb-generating');

					return;
				}
				loadedPercent = new db.Percentage(loadedPercent).toString();
				loaderText.data = loadedPercent;
			});

			itemDom = _if(isValid, fileThumb = el('div', { class: 'file-thumb' },
				el('a', { href: file._url, target: '_blank', class: 'file-thumb-image' },
					loader,
					el('img', { id: 'img-' + name, src: (function () {
						if (includes.call(docMimeTypes, file.type)) {
							return stUrl('/img/word-doc-icon.png');
						}
						if (includes.call(xlsMimeTypes, file.type)) {
							return stUrl('/img/excel-spreadsheet-icon.png');
						}

						return file.thumb._url.map(function (thumbUrl) {
							if (!thumbUrl) return;
							if (loaderText && fileThumb) {
								loaderText.data = '';
								fileThumb.classList.remove('file-thumb-generating');
							}
							return stUrl(thumbUrl);
						});
					}()) })),
				el('div', { class: 'file-thumb-actions' },
					el('span', { class: 'file-thumb-document-size' },
						map(file._diskSize, function (size) {
							if (size == null) return null;
							return ((size / 1000000).toFixed(2) + ' MB');
						})),
					el('label', { class: 'file-thumb-action' },
						el('input', { type: 'checkbox', name: name, value: '' }),
						el('span', { class: 'fa fa-trash-o' }, "delete")),
					el('a', { href: file._url, download: file._name, class: 'file-thumb-action' },
						el('span', { class: 'fa fa-download' }, "download")))));
			data.dom.appendChild(itemDom.toDOM ? itemDom.toDOM(this.document) : itemDom);
			return data;
		}
	})
});
