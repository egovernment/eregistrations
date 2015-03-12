'use strict';

var ns = require('mano').domjs.ns
  , _  = require('mano').i18n.bind('Documents');

var resolveSize = function (size) {
	if (size == null) return null;
	return ((size / 1000000).toFixed(2) + ' Mo');
};

module.exports = function (files, url) {
	return ns.ul({ class: 'file-uploader-items' }, files, function (file) {
		return ns.li(ns.div({ class: 'file-thumb' },
			ns.a({ href: file._url, target: '_blank', class: 'file-thumb-image' },
				ns.img({ src: ns.resolve(file._thumb, '_url') })),
			ns.div({ class: 'file-thumb-actions' },
				ns.span({ class: 'file-thumb-document-size' },
					ns.mmap(file._diskSize, resolveSize)),
				ns.postButton({ action: url('delete-file'),
					buttonClass: 'file-thumb-action',
					value: ns.span({ class: 'fa fa-trash-o' }, _("Delete")) },
					ns.input({ type: 'hidden', name: 'fileId', value: file.__id__ })),
				ns.a({ href: file._url, target: '_blank', class: 'file-thumb-action' },
					ns.span({ class: 'fa fa-download' }, "download")))));
	});
};
