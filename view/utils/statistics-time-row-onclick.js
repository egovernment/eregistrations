'use strict';
var getDurationDaysHours = require('./get-duration-days-hours-fine-grain')
  , db                   = require('../../db')
  , toDateTimeInTz       = require('../../utils/to-date-time-in-time-zone')
  , statisticsTimeRowOnClick;

statisticsTimeRowOnClick = function (currentRow, periodsOfRow, showUserName) {
	var jQuery = window.jQuery,
		detailRow = currentRow.next('.detail');

	if (!jQuery) return;
	if (detailRow.length === 0) {
		var rows = periodsOfRow.map(function (bp, index) {

			var lastTdContent = index === 0 ? span({
				onclick: function () {
					detailRow.hide();
				},
				class: 'cursor-pointer'
			}, 'x') : '',
				tdArr = [];

			tdArr.push(td({ class: 'background-secondary width-30' }, bp.businessName));
			if (showUserName) {
				tdArr.push(td({ class: 'background-secondary width-25' }, bp.processor));
			}
			tdArr.push(td({ class: 'background-secondary ' }, getDurationDaysHours(bp.processingTime)));
			tdArr.push(td({ class: 'background-secondary' },
				String(
					db.DateTime(toDateTimeInTz(new Date(bp.processingStart), db.timeZone))
				).slice(0, -3)));
			tdArr.push(td({ class: 'background-secondary' },
				String(db.DateTime(toDateTimeInTz(new Date(bp.processingEnd), db.timeZone))).slice(0, -3)));
			tdArr.push(td({ class: 'background-secondary' }, lastTdContent));

			return tr(tdArr);
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

module.exports = function (step, props, showUserName) {
	if (step && step.processingPeriods && step.processingPeriods.length !== 0) {
		props.class = 'cursor-pointer';
		props.onclick = function () {
			statisticsTimeRowOnClick(window.jQuery(this), step.processingPeriods, showUserName);
		};
	}
};
