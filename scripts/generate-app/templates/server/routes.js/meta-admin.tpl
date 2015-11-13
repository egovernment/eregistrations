'use strict';

var path = require('path')
  , fs = require('fs2');

module.exports = {
	'i18n.js': {
		match: function () { return true; },
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/javascript; charset=utf-8'
		},
		controller: function () {
			return fs.readFile(path.resolve(__dirname, '../../../i18n-messages.json'))(
				function (content) {
					return 'window.i18n = ' + String(content) + ';';
				}
			);
		}
	}
};
