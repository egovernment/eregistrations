'use strict';
var getDurationDaysHours = require('./get-duration-days-hours-fine-grain');

module.exports = function (currentRow, businessProcessesOfRow) {
	var jQuery = window.jQuery,
		detailRow = currentRow.next('.detail');

	if (detailRow.length === 0) {
		var rows = businessProcessesOfRow.map(function (bp, index) {

			var db = window.db;
			var user = db.User.getById(bp.processor),
				userName = user === null ? bp.processor : user.fullName,
				style = { class: 'background-secondary' },
				lastTdContent = index === 0 ? span({
					onclick: function () {
						detailRow.hide();
					},
					class: 'cursor-pointer'
				}, 'x') : '';

			return tr([
				td(style, bp.businessName),
				td(style, userName),
				td(style, getDurationDaysHours(bp.processingTime)),
				td(style, new db.DateTime(bp.processingStart)),
				td(style, new db.DateTime(bp.processingEnd)),
				td(style, lastTdContent)
			]);
		});

		detailRow = jQuery(tr({
			class: 'detail',
			style: 'display:none'
		}, td({ colspan: 5 }, table(rows))));

		detailRow.insertAfter(currentRow);
	}

	detailRow.toggle();
	return jQuery;
};
