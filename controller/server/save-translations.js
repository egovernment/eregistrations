'use strict';

var resolve   = require('path').resolve
  , writeFile = require('fs2/write-file')
  , stringify = require('eregistrations/utils/i18n-stringify')
  , root      = require('mano').env.root;

exports.save = function (data) {
	return writeFile(resolve(root, 'i18n.json'), stringify(data));
};
