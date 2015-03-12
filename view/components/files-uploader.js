'use strict';

var ns = require('mano').domjs.ns
  , _  = require('mano').i18n.bind('Documents')

  , normRe = /[$#:\/]/g;

module.exports = function (files, url) {
	var control, errorDom, errorTxt;
	var form = ns.form({ action: url('upload-files'), method: 'post', enctype: 'multipart/form-data',
		autoSubmit: true, class: ns._if(ns.resolve(files._first, '_path'), 'completed') },
		ns.p({ class: 'file-uploader-button' },
			ns.a(ns.label(_("Select file"),
				control = ns.input({ type: 'file', name: files.__id__ || files.dbId })))),
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
