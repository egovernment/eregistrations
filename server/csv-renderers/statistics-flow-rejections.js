'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , _           = require('mano').i18n;

module.exports = function (result, config) {
	ensureObject(config);
	var data;

	data = [
		[_("Rejection reasons"), "", "",
			_("Operator"), _("Role"), _("Date"), _("File")
			].join(',')
	];

	data.push.apply(data, result.map(function (row) {
		row[0] = row[0].join(' ').replace(/\r?\n|\r/g, ' ').replace(/,/g, ' ');
		return row;
	}));

	return data.join('\n');
};
