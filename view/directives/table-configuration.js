'use strict';

var forEach = Array.prototype.forEach;

module.exports = function (domjs) {
	var directives = domjs.getDirectives('table');

	directives.configuration = function (conf) {
		var tableHeadings = tr();

		forEach.call(conf.columns, function (column) {
			tableHeadings.appendChild(th({ class: column.headClass }, column.head));
		});
		this.appendChild(thead(tableHeadings));

		this.appendChild(tbody(conf.collection, function (item) {
			var itemRow = tr();

			forEach.call(conf.columns, function (column) {
				itemRow.appendChild(td({ class: column.class }, column.body(item)));
			});

			return itemRow;
		}));
	};
};
