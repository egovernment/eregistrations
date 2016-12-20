'use strict';

var isFunction = require('es5-ext/function/is-function')
  , forEach    = Array.prototype.forEach
  , some       = Array.prototype.some;

var resolveConf = function (content, item, thisArg) {
	return content && (isFunction(content) ? content.call(thisArg, item) : content);
};

module.exports = function (domjs) {
	var directives = domjs.getDirectives('table');

	directives.configuration = function (conf) {
		if (some.call(conf.columns, function (column) { return column.head != null; })) {
			var tableHeadings = tr();

			forEach.call(conf.columns, function (column) {
				tableHeadings.appendChild(th({ class: resolveConf(column.headClass, null, conf.thisArg) },
					resolveConf(column.head, null, conf.thisArg)));
			});

			this.appendChild(thead(tableHeadings));
		}

		this.appendChild(tbody(conf.collection, function (item) {
			var itemRow = tr(resolveConf(conf.rowAttributes, item, conf.thisArg));

			forEach.call(conf.columns, function (column) {
				itemRow.appendChild(td({ class: resolveConf(column.class, item, conf.thisArg) },
					resolveConf(column.data, item, conf.thisArg)));
			});

			return itemRow;
		}));
	};
};
