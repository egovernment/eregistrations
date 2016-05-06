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
		errMsg = _("Error: Uploaded file \"${ filename }\" is of not supported type \"${ type }\"",
			{ filename: this.name, type: this.type });
		this._destroy_();
		return deferred.reject(customError(errMsg, 'UNSUPPORTED_FILE_TYPE'));
	}

	return generateThumbAndPreview(this);
}));
