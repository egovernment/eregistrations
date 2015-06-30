'use strict';

exports._parent = require('./_print-main');

exports['print-page-title'] = function () {
	h2("Registration costs");
	p("19/11/2015");
};
exports.main = function () {
	ul(
		{ class: 'print-costs-list' },
		li(span("Registration fee"), " ", span("$50'000")),
		li(span("Stamp duty for registration"), " ", span("$10'000")),
		li(span("Filing fees for memorandum"), " ", span("$45'000")),
		li({ class: 'print-costs-list-total' }, span("Total Costs:"), " ", span("$105'000"))
	);
	p("LoLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa," +
		" quis vulputate diam. Morbi non dolor ac tellus finibus commodo. Donec convallis" +
		" tortor felis, et sodales quam vulputate ac.");
};
