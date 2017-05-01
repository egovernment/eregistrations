'use strict';
var getDurationDaysHours = require('./get-duration-days-hours-fine-grain'),
	db                   = require('../../db'),
	statisticsTimeRowOnClick = function (currentRow, businessProcessesOfRow, showUserName) {
		var jQuery = window.jQuery,
			detailRow = currentRow.next('.detail');

		if (detailRow.length === 0) {
			var rows = businessProcessesOfRow.map(function (bp, index) {

				var user = db.User.getById(bp.processor),
					userName = user === null ? bp.processor : user.fullName,
					lastTdContent = index === 0 ? span({
						onclick: function () {
							detailRow.hide();
						},
						class: 'cursor-pointer'
					}, 'x') : '',
					tdArr = [];

				tdArr.push(td({ class: 'background-secondary width-30' }, bp.businessName));
				if (showUserName) {
					tdArr.push(td({ class: 'background-secondary width-25' }, userName));
				}
				tdArr.push(td({ class: 'background-secondary ' }, getDurationDaysHours(bp.processingTime)));
				tdArr.push(td({ class: 'background-secondary' }, new db.DateTime(bp.processingStart)));
				tdArr.push(td({ class: 'background-secondary' }, new db.DateTime(bp.processingEnd)));
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
	if (step && step.businessProcesses.length !== 0) {
		props.class = 'cursor-pointer';
		props.onclick = function () {
			statisticsTimeRowOnClick(window.jQuery(this), step.businessProcesses, showUserName);
		};
	}
};
