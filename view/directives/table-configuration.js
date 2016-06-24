'use strict';

var isFunction = require('es5-ext/function/is-function')
  , forEach    = Array.prototype.forEach
  , some       = Array.prototype.some;

var resolveConf = function (content, item) {
	return content && (isFunction(content) ? content(item) : content);
};

module.exports = function (domjs) {
	var directives = domjs.getDirectives('table');

	directives.configuration = function (conf) {
		if (some.call(conf.columns, function (column) { return column.head != null; })) {
			var tableHeadings = tr();

			forEach.call(conf.columns, function (column) {
				tableHeadings.appendChild(th({ class: resolveConf(column.headClass) },
					resolveConf(column.head)));
			});

			this.appendChild(thead(tableHeadings));
		}

		this.appendChild(tbody(conf.collection, function (item) {
			var itemRow = tr(resolveConf(conf.rowAttributes, item));

			forEach.call(conf.columns, function (column) {
				itemRow.appendChild(td({ class: resolveConf(column.class, item) },
					resolveConf(column.data, item)));
			});

			return itemRow;
		}));
	};
};
