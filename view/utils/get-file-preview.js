'use strict';

var includes         = require('es5-ext/array/#/contains')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , docMimeTypes     = require('../../utils/microsoft-word-doc-mime-types')
  , pathToUrl        = require('../../utils/upload-path-to-url');

module.exports = function (file) {
	var type = file.type;
	if (includes.call(docMimeTypes, type)) {
		return img({ class: 'submitted-preview-new-word-document', src: '/img/word-doc-icon.png' });
	}
	if (!isReadOnlyRender && (type === 'application/pdf')) {
		return iframe({
			src: url('pdfjs/web/viewer.html?file=') + encodeURIComponent('/' + file.path)
		});
	}
	return img({
		zoomOnHover: true,
		src: mmap(or(file.previewPath, file.thumbPath), function (path) {
			if (path) return stUrl(pathToUrl(path));
		})
	});
};
