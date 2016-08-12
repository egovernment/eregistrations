'use strict';

var map          = require('observable-value/map')
  , includes     = require('es5-ext/array/#/contains')
  , docMimeTypes = require('../../utils/microsoft-word-doc-mime-types');

module.exports = function (domjs/*, options*/) {
	var ns = domjs.ns, a = ns.a, img = ns.img, span = ns.span, div = ns.div;
	domjs.ns.thumb = function (file) {
		return div({ class: 'file-thumb' },
			a({ href: file._url, target: '_blank', class: 'file-thumb-image' },
				img({ src: file.thumb._url.map(function (thumbUrl) {
					if (includes.call(docMimeTypes, file.type)) {
						return stUrl('/img/word-doc-icon.png');
					}
					if (!thumbUrl) return;
					return stUrl(thumbUrl);
				}) })),
			div({ class: 'file-thumb-actions' }, map(file._diskSize, function (size) {
				if (size == null) return null;
				return span({ class: 'file-thumb-document-size' }, (size / 1000000).toFixed(2) + ' MB');
			}),
				a({ href: file._url, target: '_blank', class: 'file-thumb-action' },
					span({ class: 'fa fa-download' }, "download"))));
	};
};
