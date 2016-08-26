'use strict';

var ensureArray    = require('es5-ext/array/valid-array')
  , ensureFunction = require('es5-ext/function/valid-function')
  , assign         = require('es5-ext/object/assign');

// Wraps each column data function in a given wrapFn so that it will be called for each column.
// wrapFn will receive all arguments from table manager and additional content from default column
// data function.
module.exports = function (columns, wrapFn) {
	ensureArray(columns);
	ensureFunction(wrapFn);

	return columns.map(function (column) {
		if (column.noWrap) return column;

		if (typeof column.data === 'function') {
			return assign({}, column, {
				data: function () {
					var content = column.data.apply(null, arguments);

					return wrapFn.apply(null, Array.from(arguments).concat(content));
				}
			});
		}

		return column;
	});
};
