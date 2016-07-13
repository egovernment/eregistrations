'use strict';

var customError = require('es5-ext/error/custom')
  , d           = require('d')
  , deferred    = require('deferred')
  , mano        = require('mano')
  , generateThumbAndPreview = require('../generate-thumb-and-preview')

  , db = mano.db, _ = mano.i18n.bind('Controller');

Object.defineProperty(db.File.prototype, 'onUpload', d(function () {
	var errMsg;

	if (!db.File.accept.has(this.type)) {
		// Workaround for Firefox bug that's kept for generations to come:
		// https://bugzilla.mozilla.org/show_bug.cgi?id=373621#c69
		if ((this.type !== 'application/x-download') || !db.File.accept.has('application/pdf')) {
			errMsg = _("Error: Uploaded file \"${ filename }\" is of not supported type \"${ type }\"",
				{ filename: this.name, type: this.type });
			this._destroy_();
			return deferred.reject(customError(errMsg, 'UNSUPPORTED_FILE_TYPE'));
		}
	}

	return generateThumbAndPreview(this);
}));
