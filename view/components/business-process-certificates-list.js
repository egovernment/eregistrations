// Certificate list

'use strict';

var _                   = require('mano').i18n.bind('User Submitted')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , multipleProcessList = require('./multiple-process-list');

module.exports = function (businessProcess/*, options*/) {
	var options = normalizeOptions(arguments[2])
	  , target  = options.uploadsResolver || businessProcess;

	return multipleProcessList(target.certificates.uploaded, _("Certificates"), options);
};
