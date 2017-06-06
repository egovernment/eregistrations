'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , tablesorterTimeRangeComaparator = require('../../utils/tablesorter-time-range-comparator');

module.exports = function (domElement/*, opts */) {
	if (!window.jQuery) return;
	window.jQuery.tablesorter.addParser({
		// set a unique id 
		id: 'times',
		is: function (s) {
			// return false so this parser is not auto detected 
			return false;
		},
		format: tablesorterTimeRangeComaparator,
		// set type, either numeric or text 
		type: 'numeric'
	});
	window.jQuery.tablesorter.addParser({
		// set a unique id 
		id: 'dates',
		is: function (s) {
			// return false so this parser is not auto detected 
			return false;
		},
		format: function (item) {
			var parsedItem = item;
			if (item.indexOf('/') !== -1) {
				parsedItem = item.replace(/\/+/g, '-').split('-').reverse().join('-');
			}
			return new Date(parsedItem);
		},
		// set type, either numeric or text 
		type: 'numeric'
	});
	var opts = normalizeOptions(arguments[1]);
	var additionalOpts = normalizeOptions(arguments[2]);

	if (additionalOpts && additionalOpts.beforeSortStartFn) {
		setTimeout(function () {
			var element = window.jQuery(domElement);
			element.bind("sortStart", function () {
				additionalOpts.beforeSortStartFn(element);
			});
			element.tablesorter(opts);
		}, 1000);
	} else {
		setInterval(function () {
			var element = window.jQuery(domElement);
			element.trigger('update');
			element.tablesorter(opts);
		}, 500);
	}

};
