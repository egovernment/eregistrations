'use strict';

var isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , ns               = require('mano').domjs.ns
  , _                = require('mano').i18n.bind('View: Component: File upload')

  , normRe = /[$#:\/]/g;

var acceptToString = function (accept) {
	var data = [];
	if (!accept || (typeof accept.forEach !== 'function')) return null;
	accept.forEach(function (type) { data.push(type); });
	return String(data);
};

module.exports = function (files, url, orderedFiles) {
	var control, errorDom, errorTxt, type;
	if (files.__id__) type = files.__descriptorPrototype__.type;
	else type = files.object._getDescriptor_(files.__pSKey__).type;
	var form = ns.form({ action: url('upload-files'), method: 'post', enctype: 'multipart/form-data',
		autoSubmit: true, class:
		[ns._if(ns.resolve((orderedFiles || files)._first, '_path'), 'completed'),
			(!isReadOnlyRender && 'auto-submit') || null] },
		ns.p({ class: 'file-uploader-button' },
			ns.a(ns.label(_("Select file"),
				control = ns.input({ type: 'file', name: files.__id__ || files.dbId, multiple: true,
					accept: acceptToString(type.accept) })))),
		errorDom = ns.p({ class: 'error-message error-message-' +
			(files.__id__ || files.dbId).replace(normRe, '-') }, ""),
		ns.p({ class: 'submit' }, ns.input({ type: 'submit', value: _("Submit") })));
	errorTxt = errorDom.firstChild;
	control.addEventListener('invalid', function (e) {
		e.preventDefault();
		errorTxt.data = this.validationMessage;
	});
	control.addEventListener('change', function () { errorTxt.data = ""; });
	return form;
};
