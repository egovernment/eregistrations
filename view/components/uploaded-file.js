'use strict';

var ns = require('mano').domjs.ns
  , _  = require('mano').i18n.bind('View: Component: File upload');

var resolveSize = function (size) {
	if (size == null) return null;
	return ((size / 1000000).toFixed(2) + ' Mo');
};

module.exports = function (observable/*, options*/) {
	var options = Object(arguments[1])
	  , url = options.url || ns.url
	  , deleteByCheckbox = options.deleteByCheckbox;
	return ns._if(ns.resolve(observable, '_name'),
		ns.div({ class: 'file-thumb' },
			ns.a({ href: ns.resolve(observable, '_url'), target: '_blank', class: 'file-thumb-image' },
				ns.img({ src: observable.thumb._url.map(function (thumbUrl) {
					if (!thumbUrl) return;
					return stUrl(thumbUrl);
				}) })),
			ns.div({ class: 'file-thumb-actions' },
				ns.span({ class: 'file-thumb-document-size' },
					ns.mmap(ns.resolve(observable, '_diskSize'), resolveSize)),
				deleteByCheckbox
				? ns.label(ns.input({ type: 'checkbox',
					name: ns.resolve(observable, '__id__'), value: '' }),
					" ", ns.span({ class: 'file-thumb-action' },
						ns.span({ class: 'fa fa-trash-o' }, _("Delete"))))
				: ns.postButton({ action: url('delete-file'),
					buttonClass: 'file-thumb-action',
					value: ns.span({ class: 'fa fa-trash-o' }, _("Delete")) },
					ns.input({ type: 'hidden', name: 'fileId', value: ns.resolve(observable, '__id__') })),
				ns.a({ href: ns.resolve(observable, '_url'), target: '_blank', class: 'file-thumb-action' },
					ns.span({ class: 'fa fa-download' }, "download")))));
};
