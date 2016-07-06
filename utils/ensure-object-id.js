'use strict';

var ensureString = require('es5-ext/object/validate-stringifiable-value')
  , is           = require('./is-object-id');

module.exports = function (id) {
	id = ensureString(id);
	if (is(id)) return id;
	throw new TypeError(id + " is not a database object id");
};
