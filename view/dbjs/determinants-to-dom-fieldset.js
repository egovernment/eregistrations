'use strict';

var d  = require('d')
  , db = require('mano').db
  , normalizeOptions = require('es5-ext/object/normalize-options');

require('./form-section-base');

module.exports = function (/* options */) {
	console.log('jest');
	var businessProcessProto, opts = Object(arguments[0]);
	businessProcessProto = (opts.target && opts.target.prototype) || db.BusinessProcess.prototype;
	Object.defineProperties(businessProcessProto.determinants, {
		toDOMFieldset: d(function (document/*, options*/) {
			var options = normalizeOptions(arguments[1]);

			options.customize = function (data) {
				var fieldset = data.fieldset,
					masterId = data.master.__id__;
				console.log(fieldset, masterId);

			};
			return db.FormSection.prototype.toDOMFieldset.call(this, document, options);
		})
	});
};
