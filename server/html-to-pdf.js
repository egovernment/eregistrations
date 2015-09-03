'use strict';

var ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , deferred         = require('deferred')
  , compileTemplate  = require('es6-template-strings/compile')
  , resolveTemplate  = require('es6-template-strings/resolve-to-string')
  , readFile         = require('fs2/read-file')
  , dirname          = require('path').dirname
  , memoize          = require('memoizee/plain')
  , htmlToPdf        = require('html-pdf')
  , PDF              = require('html-pdf/lib/pdf')
  , _                = require('mano').i18n.bind('PDF Generation')
  , encode           = require('ent').encode
  , md2Html          = require('i18n2-md-to-dom/lib/md-to-html')

  , defaultRenderOptions = { format: "A4", orientation: "portrait", border: 0 };

PDF.prototype.toFilePromise = deferred.promisify(PDF.prototype.toFile);

var getTemplate = memoize(function (htmlPath) {
	return readFile(htmlPath)(function (template) { return compileTemplate(template); });
});

module.exports = function (htmlPath, pdfPath/*, options*/) {
	var options = normalizeOptions(arguments[2]);
	ensureString(htmlPath);
	ensureString(pdfPath);
	return getTemplate(htmlPath)(function (htmlTemplate) {
		var inserts = normalizeOptions(options.templateInserts, {
			root: 'file://' + dirname(htmlPath) + '/',
			_: _,
			e: encode,
			md: md2Html
		});
		delete options.templateInserts;
		return htmlToPdf.create(resolveTemplate(htmlTemplate, inserts),
			normalizeOptions(defaultRenderOptions, options)).toFilePromise(pdfPath);
	});
};
