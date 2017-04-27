'use strict';
	/*
	To use rangepicker prepend following snippet to index.html.tpl
	document
	.write('<scr' + 'ipt data-spa crossorigin defer src="/js/jquery.min.js"></sc' + 'ript>');
	document
	.write('<scr' + 'ipt data-spa crossorigin defer src="/js/jquery-ui.min.js"></sc' + 'ript>');
	document
	.write('<scr' + 'ipt data-spa crossorigin defer src="/js/moment.min.js"></sc' + 'ript>');
	document
	.write('<scr' +
	'ipt data-spa crossorigin defer src="/js/jquery.comiseo.daterangepicker.js"></sc' + 'ript>');
	*/
var _ = require('mano').i18n.bind('Daterange')
  , dateFrom = require('./select-date-from')
  , dateTo = require('./select-date-to')
  , location = require('mano/lib/client/location')
  , moment = window.moment
  , jQuery = window.jQuery;

module.exports = function (/* opts */) {
	var opts = Object(arguments[0]);

	var dateToString = function (date) {
		return moment(date).format('YYYY-MM-DD').toString();
	};

	var stringToDate = function (string) {
		return moment(string).toDate();
	};

	setTimeout(function () {
		if (!$('startId')) {
			return;
		}
		if (!$('endId')) {
			return;
		}
		if (!jQuery) {
			console.error('Probably you will have to integrate JQuery and all ' +
				'rangepicker dependencies into into index.html.tpl file. ' +
				'Check select-date-range.js for instructions.');
		}
		var elem = jQuery('[rangepicker]');
		elem.daterangepicker({
			presetRanges: [{
				text: _('Today'),
				dateStart: function () {
					return moment();
				},
				dateEnd: function () {
					return moment();
				}
			}, {
				text: _('Yesterday'),
				dateStart: function () {
					return moment().subtract('days', 1);
				},
				dateEnd: function () {
					return moment();
				}
			}, {
				text: _('Week to date'),
				dateStart: function () {
					// JS week starts on Sunday
					return moment().startOf('week').add(1, 'days');
				},
				dateEnd: function () {
					return moment();
				}
			}, {
				text: _('Month to date'),
				dateStart: function () {
					return moment().startOf('month');
				},
				dateEnd: function () {
					return moment();
				}
			}, {
				text: _('Last month'),
				dateStart: function () {
					return moment().subtract(1, 'months').startOf('month');
				},
				dateEnd: function () {
					return moment().subtract(1, 'months').endOf('month');
				}
			}, {
				text: _('Year to date'),
				dateStart: function () {
					return moment().startOf('year');
				},
				dateEnd: function () {
					return moment();
				}
			}, {
				text: _('Since launch'),
				dateStart: function () {
					return moment(("2016-09-01"));
				},
				dateEnd: function () {
					return moment();
				}
			}],
			datepickerOptions: {
				firstDay: 1,
				dayNamesMin: [_('Su'), _('Mo'), _('Tu'), _('We'), _('Th'), _('Fr'), _('Sa')],
				monthNames: [_('January'), _('February'), _('March'), _('April'),
					_('May'), _('June'), _('July'), _('August'),
					_('September'), _('October'), _('November'), _('December')],
				numberOfMonths: 2,
				initialText: _('Select period...')
			},
			applyButtonText: _('Apply'),
			clearButtonText: _('Clear'),
			cancelButtonText: _('Cancel'),
			mirrorOnCollision: true
		});
		elem.daterangepicker("setRange", {
			start: stringToDate(jQuery('#startId').val()),
			end: stringToDate(jQuery('#endId').val())
		});
		elem.on('change', function () {
			var range = elem.daterangepicker("getRange");
			jQuery('#startId').val(dateToString(range.start));
			jQuery('#endId').val(dateToString(range.end));
			$.dispatchEvent($('startId'), 'change');
			$.dispatchEvent($('endId'), 'change');
		});

		var path = location.pathname;
		location.on('change', function () {
			if (location.pathname !== path) {
				path = location.pathname;
				if (elem) {
					elem.daterangepicker("setRange", {
						start: stringToDate(jQuery('#startId').val()),
						end: stringToDate(jQuery('#endId').val())
					});
				}
			}
		});
	});

	return div(
		dateFrom({
			id: 'startId',
			type: 'hidden'
		}),
		dateTo({
			id: 'endId',
			type: 'hidden'
		}),
		input({
			id: opts.id || 'rangepicker',
			rangepicker: ''
		})
	);
};
