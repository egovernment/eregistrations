'use strict';

var includes         = require('es5-ext/array/#/contains')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , docMimeTypes     = require('../../utils/microsoft-word-doc-mime-types');

module.exports = function (file) {
	var type = file.type;
	if (includes.call(docMimeTypes, type)) {
		return img({ class: 'submitted-preview-new-word-document', src: '/img/word-doc-icon.png' });
	}
	if (!isReadOnlyRender && (type === 'application/pdf')) {
		return iframe({
			src: url('pdfjs/web/viewer.html?file=') + file.path
		});
	}
	return img({ zoomOnHover: true, src: or(resolve(file._preview, '_url'),
		resolve(file._thumb, '_url')) });
};
