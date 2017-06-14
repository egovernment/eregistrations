'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , _           = require('mano').i18n;

module.exports = function (result, config) {
	ensureObject(config);
	var data;

	data = [
		[_("Category"), _("Certificate"), _("Number of issued")].join(',')
	];

	result.forEach(function (item) {
		data.push(item.header);
		item.data.forEach(function (row) {
			data.push(row.join(','));
		});
	});

	return data.join('\n');
};
