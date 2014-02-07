'use strict';

var d        = require('d/d')
  , isNested = require('dbjs/is-dbjs-nested-object')
  , _if      = require('observable-value/if')
  , map      = require('observable-value/map')
  , resolve  = require('observable-value/resolve')

  , db       = require('mano').db;

Object.defineProperties(db.SubmissionFile, {
	inputRender: d(function (options) {
		var el = this.make;
		return el('div', this.valueDOM = el('ul', { class: 'documents' }),
			el('div', { class: 'btn-upload' },
				el('label', options.label,
					this.control = el('input', { type: 'file' }))));
	}),
	inputRenderItem: d(function (file) {
		var el = this.make, data = {}, remove;

		data.dom = el('li', { 'data-id': file.__id__ });

		remove = isNested(file)
			? file.owner._clearNested_.bind(file.owner, file.__sKey__)
			: this.removeItem.bind(this, data.dom);

		data.dom.appendChild(_if(file._url, el('span',
			el('a', { href: file._url, target: '_blank', class: 'thumb-doc' },
				el('img', { src: resolve(file._thumb, '_url') })),
			el('span', { class: 'thumb-doc-action' },
				map(file._diskSize, function (size) {
					if (size == null) return null;
					return ((size / 1000000).toFixed(2) + ' Mo');
				})),
			data.control = el('input', { type: 'hidden', name: this.name,
				value: file.__id__ }),
			el('a', { class: 'thumb-doc-action', onclick: remove },
				el('i', { class: 'icon-trash' })),
			el('a', { href: file._url, target: '_blank',
				class: 'dlBtn thumb-doc-action' },
				el('i', { class: 'icon-arrow-down' }))),
			el('input', { type: 'hidden', name: this.name, value: file.__id__ }))
			.toDOM(this.document));
		return data;
	})
});
