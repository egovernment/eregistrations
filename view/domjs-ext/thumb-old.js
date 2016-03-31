'use strict';

var map     = require('observable-value/map')
  , resolve = require('observable-value/resolve');

module.exports = function (domjs/*, options*/) {
	var ns = domjs.ns, a = ns.a, i = ns.i, img = ns.img, p = ns.p, span = ns.span;
	domjs.ns.thumb = function (file) {
		return p(a({ href: file._url, target: '_blank', class: 'thumb-doc' },
			img({ src: stUrl(resolve(file._thumb, '_url')) })),
			span({ class: 'thumb-doc-action' }, map(file._diskSize, function (size) {
				if (size == null) return null;
				return ((size / 1000000).toFixed(2) + ' Mo');
			})),
			a({ href: file._url, target: '_blank', class: 'dlBtn thumb-doc-action' },
				i({ class: 'icon-arrow-down' })));
	};
	domjs.refreshViewNs();
};
