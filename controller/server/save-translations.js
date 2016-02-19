'use strict';

var resolve   = require('path').resolve
  , writeFile = require('fs2/write-file')
  , stringify = require('eregistrations/utils/i18n-stringify')
  , root      = require('mano').env.root;

if (!root) throw new Error("`env.root` not defined");

exports.submit = function (data) {
	return writeFile(resolve(root, 'i18n-messages.json'), stringify(data));
};
