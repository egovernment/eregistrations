'use strict';

var isFunction = require('es5-ext/function/is-function')
  , forEach    = Array.prototype.forEach;

var resolveConf = function (content, item) {
	return content && (isFunction(content) ? content(item) : content);
};

module.exports = function (domjs) {
	var directives = domjs.getDirectives('table');

	directives.configuration = function (conf) {
		var tableHeadings = tr()
		  , headContent;

		forEach.call(conf.columns, function (column) {
			headContent = resolveConf(column.head);

			tableHeadings.appendChild(th({ class: resolveConf(column.headClass) },
				headContent));
		});
		if (headContent) this.appendChild(thead(tableHeadings));

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
